import { generateCompletion } from '../api/groqClient';
import { config } from '../config';

export const generateCommitMessage = async (diff: string) => {
  const systemMessage = {
    role: 'system' as const,
    content:
      config.COMMIT_PROMPT ||
      `
    You are an AI assistant tasked with generating semantic commit messages following the Conventional Commits specification.  

    Summarize the given diff and Generate infomative commit message for following git diff with maximum 50 characters for TITLE and maximum 70 characters for DESCRIPTION:


      Please add Preffix by category:
- [ADD]: For new features, functions, or files.
- [FIX]: For bug fixes or corrections.
- [UPDATE]: For updates or modifications to existing code.
- [REMOVE]: For deletions of code or functionality.
- [DEBUG]: For general tasks, maintenance, or minor changes.

THE FINAL MESSAGE FORMAT:

[$PREFFIX] - $TITLE

$DESCRIPTION

    DO NOT ANSWER WITH OTHER WORDS, JUST ANSWER WITH THE FINAL MESSAGE FORMAT ONLY
  `,
  };

  const userInputMessage = {
    role: 'user' as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  try {
    const commitMessage = await generateCompletion(messages);

    if (
      !commitMessage ||
      commitMessage.includes('undefined') ||
      commitMessage.includes('Here is') ||
      commitMessage.includes('here is') ||
      commitMessage.includes("here's") ||
      commitMessage.includes("Here's") ||
      commitMessage.includes('Commit') ||
      commitMessage.includes('commit')
    ) {
      throw new Error('Invalid commit message generated.');
    }
    return commitMessage;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to generate commit message: ${error.message}`);
    } else {
      console.error('Failed to generate commit message: Unknown error');
    }
    process.exit(1);
  }
};

export const generatePullRequest = async (diff: string) => {
  const systemMessage = {
    role: 'system' as const,
    content: `
      KEEP IN MIND THAT YOU SHOULD ONLY REPLY WITH THE PULL REQUEST TITLE AND DESCRIPTION IN MARKDOWN FORMAT! DO NOT INCLUDE ANY OTHER TEXT OR COMMENTS.

      You are an AI designed to generate a concise and informative pull request title and a detailed description in Markdown format. The title should be short and informative, while the description should be structured into multiple sections to provide thorough context about the changes.

      Use the following guidelines for generating the pull request title and description:

      ### PR Title
      - The PR title should summarize the change in a single sentence, no more than 60 characters.

      ### PR Description

      ...
      
      KEEP IN MIND THAT YOU SHOULD ONLY REPLY WITH THE PULL REQUEST TITLE AND DESCRIPTION IN MARKDOWN FORMAT! DO NOT INCLUDE ANY OTHER TEXT OR COMMENTS.
      `,
  };

  const userInputMessage = {
    role: 'user' as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
};
