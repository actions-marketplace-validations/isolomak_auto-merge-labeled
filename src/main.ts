import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { executeAction } from './action';
import { DEFAULT_MERGE_LABEL } from './types/constants';

async function run(): Promise<void> {
	try {
		const token = process.env.GITHUB_TOKEN;
		const label = getInput('label') || DEFAULT_MERGE_LABEL;

		const commitTitle = getInput('commit-title');
		const commitMessage = getInput('commit-message');
		const mergeMethod = getInput('merge-method');	

		if (!token) {
			throw new Error(`GITHUB_TOKEN env variable is missing`);
		}

		if (!label) {
			throw new Error(`Label input is missing`);
		}

		const octokit = getOctokit(token);

		await executeAction(context, octokit, { label, commitTitle, commitMessage, mergeMethod });
	}
	catch (error) {
		if (error instanceof Error) setFailed(error.message);
	}
}

run();
