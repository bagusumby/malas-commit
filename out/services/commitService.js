import { generateCompletion } from '../api/groqClient.js';
import { config } from '../config.js';
export const generateCommitMessage = async (diff) => {
  const systemMessage = {
    role: 'system',
    content:
      config.COMMIT_PROMPT ||
      `
    You are an AI assistant tasked with generating semantic commit messages following the Conventional Commits specification.  

    STRICTLY follow the given format:  

      <type>(<scope>): <subject>  

      * <type> MUST be one of:  
        - feat  
        - fix  
        - docs  
        - style  
        - test  
        - chore  
      * <scope> MUST be one of:  
        - api
        - ui
        - or nothing
      * <subject>: A concise description of the change, written in present tense, without a period at the end.  

    ADDITIONAL RULES:  
      * Only "api" or "ui" are allowed as scope. DO NOT use any other scope.  
      * DO NOT add unnecessary words like "Here is the commit message".  
      * If the change does not relate to API, **it MUST use "ui" as the scope**.  
      * Stick strictly to this format without any deviation.  

    EXAMPLES:  
      - feat(api): add user authentication  
      - fix(ui): resolve button misalignment  
      - fix(ui): update fillAuditTrail call in login method
      - test: Add Test On Action  

    STRICTLY FOLLOW THIS FORMAT. DO NOT ADD ANY ADDITIONAL INFORMATION OR HEADERS. ONLY RETURN THE COMMIT MESSAGE ITSELF.
    KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
      DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
  `,
  };
  const userInputMessage = {
    role: 'user',
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
export const generatePullRequest = async (diff) => {
  const systemMessage = {
    role: 'system',
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
    role: 'user',
    content: `Here's the git diff:\n${diff}`,
  };
  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
};
