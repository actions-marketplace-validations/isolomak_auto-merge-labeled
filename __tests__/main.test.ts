import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { executeAction } from '../src/action';
import { DEFAULT_MERGE_LABEL } from '../src/types/constants';

let octokit: InstanceType<typeof GitHub>;
let context: Context;

const givenPullRequest = { number: 123, title: 'Test PR', labels: [{ name: 'auto-merge' }, { name: 'test-merge' }] };

beforeEach(() => {
	octokit = {
		rest: {
			pulls: {
				merge: jest.fn(() => {}),
				list: () => {
					return {
						data: [
							Object.assign({}, givenPullRequest)
						]
					}
				}
			}
		}
	} as unknown as InstanceType<typeof GitHub>;
	context = {
		repo: {
			owner: 'test-owner',
			'repo': 'test-repo'
		}
	} as Context;
});

test('should merge pull request with default params', async () => {
	// WHEN
	await executeAction(context, octokit, { label: DEFAULT_MERGE_LABEL });

	//THEN
	await expect(octokit.rest.pulls.merge).toHaveBeenCalledWith(
		expect.objectContaining({
			owner: context.repo.owner,
			repo: context.repo.repo,
			pull_number: 123,
			commit_title: `Merge pull request #123 with auto-merge-labeled workflow action`,
			commit_message: `build(auto-merge-labeled): automatic pull request #123 merge`,
			merge_method: 'merge'
		})
	);
});

test('should skip merge pull request without label', async () => {
	// WHEN
	await executeAction(context, octokit, { label: 'non_existent_label' });

	//THEN
	await expect(octokit.rest.pulls.merge).toBeCalledTimes(0);
});
