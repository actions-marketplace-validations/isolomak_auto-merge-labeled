import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';

export interface IExecuteActionInput {
	label: string;
	commitTitle?: string;
	commitMessage?: string;
	mergeMethod?: string;
}

export const AVAILABLE_MERGE_METHODS = ['merge', 'squash', 'rebase'];

export async function executeAction(context: Context, octokit: InstanceType<typeof GitHub>, input: IExecuteActionInput): Promise<void> {
	// const eventName = process.env.GITHUB_EVENT_NAME
	const { label, mergeMethod, commitTitle, commitMessage } = input;

	if (mergeMethod && !AVAILABLE_MERGE_METHODS.includes(mergeMethod)) {
		throw new Error(`Invalid "merge-method": "${mergeMethod}". Expecting one of ${JSON.stringify(AVAILABLE_MERGE_METHODS)}`);
	}

	console.info('Fetching pull requests with status "open"');

	const { data: pullRequests } = await octokit.rest.pulls.list({
		owner: context.repo.owner,
		repo: context.repo.repo,
		state: 'open'
	});

	console.info(`Fetched ${pullRequests.length} pull requests`);

	for (const pullRequest of pullRequests) {
		console.info(`Handling pull request #${pullRequest.number} title:${pullRequest.title}`);

		const labelNames = pullRequest.labels.map(item => item.name);

		if (labelNames.includes(label)) {
			console.info(`Merging pull request #${pullRequest.number}`);

			await octokit.rest.pulls.merge({
				owner: context.repo.owner,
				repo: context.repo.repo,
				pull_number: pullRequest.number,
				commit_title: commitTitle || `Merge pull request #${pullRequest.number} with auto-merge-labeled workflow action`,
				commit_message: commitMessage || `build(auto-merge-labeled): automatic pull request #${pullRequest.number} merge`,
				merge_method: mergeMethod as 'merge' || 'merge'
			});
		}
		else {
			console.info(`Label "${label}" not found in labels ${JSON.stringify(labelNames)}. Skipping pull request #${pullRequest.number}`);
		}
	}

	console.info(`Action auto-merge-labeled completed`);
}
