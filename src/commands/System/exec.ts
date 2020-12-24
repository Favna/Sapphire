// Exec command from Gitcord (https://github.com/gitcord-project) Copyright 2020 Charalampos Fanoulis, used under the MIT license
import { PreConditions } from '#lib/types/Types';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { exec } from '#utils/exec';
import { fetch, FetchMethods, FetchResultTypes } from '#utils/util';
import { Message, MessageAttachment } from 'discord.js';
import SapphireCommand from '#lib/SapphireCommand';

@ApplyOptions<CommandOptions>({
	aliases: ['execute'],
	description: 'Execute a command on the host system',
	detailedDescription: 'Reserved only for owners',
	preconditions: [PreConditions.OwnerOnly]
})
export default class ExecCommand extends SapphireCommand {
	public async run(message: Message, args: Args) {
		const input = await args.pick('string');
		const result = await exec(input, { timeout: 60000 }).catch((error) => ({
			stdout: null,
			stderr: error
		}));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
		const joined = [output, outerr].join('\n') || 'No output';

		return message.channel.send(
			joined.length > 2000 ? await this.getHaste(joined).catch(() => new MessageAttachment(Buffer.from(joined), 'output.txt')) : joined
		);
	}

	private async getHaste(result: string) {
		const { key } = (await fetch('https://hasteb.in/documents', { method: FetchMethods.Post, body: result }, FetchResultTypes.JSON)) as {
			key: string;
		};
		return `https://hasteb.in/${key}.js`;
	}
}