import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Octokit } from 'octokit';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database
type Repository = {
  id: string;
  name: string;
  owner: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  url: string;
};

type PullRequest = {
  id: string;
  repoId: string;
  number: number;
  title: string;
  url: string;
  status: 'scanned' | 'pending' | 'failed';
  timestamp: string;
  advancedData?: {
    summary: string;
    reverseRequirements: string;
    burnoutEmpathy: string;
    busFactorDocs: string;
    chaosMeshTest: string;
    dependencyFuturism: string;
  };
};

type Finding = {
  id: string;
  prId: string;
  filePath: string;
  lineNumber?: number;
  severity: 'Blocker' | 'Warning' | 'Info';
  description: string;
  snippet: string;
  suggestedFix: string;
  status: 'active' | 'dismissed' | 'applied';
  personaDebate?: {
    security: string;
    architect: string;
    junior: string;
  };
  mermaidDiagram?: string;
  exploitScript?: string;
  impactScore?: {
    carbonCost: string;
    cognitiveLoad: number;
  };
  complianceWarning?: string;
  chestertonsFence?: string;
  generatedUnitTest?: string;
  bountyValue?: number;
};

const db = {
  repositories: [
    { id: '1', name: 'demo-repo', owner: 'testuser', syncStatus: 'synced', url: 'https://github.com/testuser/demo-repo' }
  ] as Repository[],
  pullRequests: [] as PullRequest[],
  findings: [] as Finding[],
};

// --- Helper Functions ---

const extractPrInfo = (prUrl: string) => {
  // e.g. https://github.com/owner/repo/pull/123
  const urlObj = new URL(prUrl);
  const parts = urlObj.pathname.split('/').filter(Boolean);
  if (parts.length >= 4 && parts[2] === 'pull') {
    return { owner: parts[0], repo: parts[1], pull_number: parseInt(parts[3], 10) };
  }
  return null;
};

const getOctokit = (req: express.Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('GitHub PAT missing in authorization header');
  return new Octokit({ auth: token });
};

// --- API Routes ---

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Get all tracked repos
app.get('/api/repos', (req, res) => {
  res.json(db.repositories);
});

// Get review history (all PRs)
app.get('/api/prs', (req, res) => {
  res.json(db.pullRequests);
});

// Get a specific PR by ID
app.get('/api/prs/:id', (req, res) => {
  const pr = db.pullRequests.find(p => p.id === req.params.id);
  if (!pr) return res.status(404).json({ error: 'PR not found' });
  const findings = db.findings.filter(f => f.prId === pr.id);
  res.json({ pr, findings });
});

// Analyze PR
app.post('/api/analyze-pr', async (req, res) => {
  const { prUrl, customRules } = req.body;
  if (!prUrl) return res.status(400).json({ error: 'prUrl is required' });

  const prInfo = extractPrInfo(prUrl);
  if (!prInfo) return res.status(400).json({ error: 'Invalid GitHub PR URL' });

  try {
    const octokit = getOctokit(req);
    
    // 1. Fetch PR details
    const prRes = await octokit.rest.pulls.get({
      owner: prInfo.owner,
      repo: prInfo.repo,
      pull_number: prInfo.pull_number
    });

    const prData = prRes.data;

    // Save Repo if not exists
    let repo = db.repositories.find(r => r.owner === prInfo.owner && r.name === prInfo.repo);
    if (!repo) {
      repo = {
        id: Date.now().toString() + '-repo',
        owner: prInfo.owner,
        name: prInfo.repo,
        syncStatus: 'synced',
        url: `https://github.com/${prInfo.owner}/${prInfo.repo}`
      };
      db.repositories.push(repo);
    }

    // Save PR
    const prId = Date.now().toString() + '-pr';
    const newPr: PullRequest = {
      id: prId,
      repoId: repo.id,
      number: prData.number,
      title: prData.title,
      url: prUrl,
      status: 'scanned',
      timestamp: new Date().toISOString()
    };
    db.pullRequests.push(newPr);

    // 2. Fetch PR Diff
    const diffRes = await octokit.rest.pulls.get({
      owner: prInfo.owner,
      repo: prInfo.repo,
      pull_number: prInfo.pull_number,
      mediaType: { format: 'diff' }
    });

    const diffContent = diffRes.data as unknown as string;

    // 3. Analyze with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Requires GEMINI_API_KEY in env
    
    const prompt = `
You are a senior security and quality engineer. Analyze the following GitHub PR diff.
Look for vulnerabilities, logic flaws, N+1 queries, and code quality issues.
Custom Rules from user: ${customRules || 'None'}

In addition to traditional findings, you must also provide advanced insights where applicable:
1. Multi-Persona Debate: Provide 1-2 sentences each from a "Security Paranoid", a "Pedantic Architect", and a "Junior Dev" arguing about this finding.
2. Visual Logic Diff: Provide a VERY SHORT mermaid.js state Diagram showing the flaw.
3. Exploit Script: If it's a vulnerability, provide a short bash/curl/python script demonstrating how to exploit it.
4. Impact Score: Provide an estimated "carbonCost" string (e.g. "+$4/mo compute waste") and a "cognitiveLoad" integer out of 10.
5. Compliance Warning: If the code touches PII, IP logging, or crypto, cite a possible GDPR/Compliance violation.
6. Chesterton's Fence: Guess why the previous developer might have written it this way originally.
7. Generated Unit Test: Write a unit test specifically designed to catch the bug you found.
8. Bounty Value: Assign a gamified dollar value (integer) to this bug based on severity.

Return the output strictly as a JSON object with this exact schema:
{
  "summary": "string (A high-level human-readable summary of the entire PR)",
  "reverseRequirements": "string (Guess the original Jira ticket or Business Requirement this PR is trying to solve)",
  "burnoutEmpathy": "string (Analyze the code/commit message for signs of developer burnout or rushing, offer a gentle suggestion)",
  "busFactorDocs": "string (Generate markdown documentation explaining complex/legacy logic touched in this PR)",
  "chaosMeshTest": "string (Generate a Chaos Engineering test idea/script for the new logic)",
  "dependencyFuturism": "string (If new dependencies are added, predict their 12-month survival probability)",
  "findings": [
    {
      "filePath": "string (the path to the file)",
      "severity": "Blocker" | "Warning" | "Info",
      "description": "string (short explanation of the issue)",
      "snippet": "string (the specific vulnerable code)",
      "suggestedFix": "string (the improved code replacing the snippet, full function rewrite if needed)",
      "personaDebate": { "security": "string", "architect": "string", "junior": "string" },
      "mermaidDiagram": "string (valid mermaid.js syntax)",
      "exploitScript": "string (valid exploit script code)",
      "impactScore": { "carbonCost": "string", "cognitiveLoad": "number" },
      "complianceWarning": "string",
      "chestertonsFence": "string",
      "generatedUnitTest": "string",
      "bountyValue": "number"
    }
  ]
}

If a specific advanced field inside a finding doesn't make sense, omit that key.

PR Diff:
${diffContent}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text || "{}";
    let aiPayload: any = {};
    try {
      aiPayload = JSON.parse(aiText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", aiText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    newPr.advancedData = {
      summary: aiPayload.summary || 'No summary provided.',
      reverseRequirements: aiPayload.reverseRequirements || 'Could not determine requirements.',
      burnoutEmpathy: aiPayload.burnoutEmpathy || '',
      busFactorDocs: aiPayload.busFactorDocs || '',
      chaosMeshTest: aiPayload.chaosMeshTest || '',
      dependencyFuturism: aiPayload.dependencyFuturism || ''
    };

    const rawFindings = Array.isArray(aiPayload.findings) ? aiPayload.findings : [];

    const createdFindings: Finding[] = rawFindings.map((f: any) => ({
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(7),
      prId: newPr.id,
      filePath: f.filePath,
      severity: f.severity || 'Info',
      description: f.description,
      snippet: f.snippet,
      suggestedFix: f.suggestedFix,
      status: 'active',
      personaDebate: f.personaDebate,
      mermaidDiagram: f.mermaidDiagram,
      exploitScript: f.exploitScript,
      impactScore: f.impactScore,
      complianceWarning: f.complianceWarning,
      chestertonsFence: f.chestertonsFence,
      generatedUnitTest: f.generatedUnitTest,
      bountyValue: typeof f.bountyValue === 'number' ? f.bountyValue : undefined
    }));

    db.findings.push(...createdFindings);

    res.json({
      pr: newPr,
      findings: createdFindings
    });

  } catch (error: any) {
    console.error("analyze-pr error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Commit suggestion
app.post('/api/commit-suggestion', async (req, res) => {
  const { findingId } = req.body;
  if (!findingId) return res.status(400).json({ error: 'findingId is required' });

  const finding = db.findings.find(f => f.id === findingId);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });

  const pr = db.pullRequests.find(p => p.id === finding.prId);
  if (!pr) return res.status(404).json({ error: 'Associated PR not found' });

  const repo = db.repositories.find(r => r.id === pr.repoId);
  if (!repo) return res.status(404).json({ error: 'Associated Repo not found' });

  try {
    const octokit = getOctokit(req);
    
    // 1. Get PR details to find branch name
    const prRes = await octokit.rest.pulls.get({
      owner: repo.owner,
      repo: repo.name,
      pull_number: pr.number
    });
    
    const branchName = prRes.data.head.ref;
    
    // 2. Fetch current file content
    const fileRes = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.name,
      path: finding.filePath,
      ref: branchName
    });

    if (Array.isArray(fileRes.data) || !('content' in fileRes.data)) {
      throw new Error('Could not fetch file content (might be a directory)');
    }

    const currentContent = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
    const fileSha = fileRes.data.sha;

    // 3. Ask Gemini to apply the fix
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
Apply the following fix to the provided file content.
Do NOT wrap the output in markdown codeblocks. Output ONLY the raw updated file content.

Issue: ${finding.description}
Vulnerable Snippet: 
${finding.snippet}
Suggested Fix:
${finding.suggestedFix}

File Content:
${currentContent}
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt
    });

    let updatedContent = response.text || currentContent;
    
    // clean up potential markdown formatting if Gemini ignored instructions
    if (updatedContent.startsWith('```')) {
      const lines = updatedContent.split('\n');
      lines.shift(); // remove first line
      if (lines[lines.length - 1].startsWith('```')) {
        lines.pop();
      }
      updatedContent = lines.join('\n');
    }

    // 4. Commit to GitHub
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.owner,
      repo: repo.name,
      path: finding.filePath,
      message: `fix: AI suggested fix for ${finding.filePath}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: fileSha,
      branch: branchName
    });

    finding.status = 'applied';
    res.json({ success: true, message: 'Fix committed successfully' });

  } catch (error: any) {
    console.error("commit-suggestion error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Dismiss finding
app.post('/api/dismiss-finding', (req, res) => {
  const { findingId } = req.body;
  if (!findingId) return res.status(400).json({ error: 'findingId is required' });

  const finding = db.findings.find(f => f.id === findingId);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });

  finding.status = 'dismissed';
  res.json({ success: true, finding });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
