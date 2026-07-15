import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getSyntaxContext, getSyntaxPrefix } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('uses the isolated PHP grammar without adding an opening tag', () => {
		const source = '<?php\n$first = 1;\nforeach ($items as $item) {}\n';
		const selectionStart = source.indexOf('foreach');

		assert.deepStrictEqual(getSyntaxContext('php', source, selectionStart), {
			languageId: 'separate-php',
			prefix: ''
		});
	});

	test('does not add PHP context when the selection contains the opening tag', () => {
		const source = '<main>HTML</main>\n<?php\n$value = 1;';
		const selectionStart = source.indexOf('<?php');

		assert.strictEqual(getSyntaxPrefix('php', source, selectionStart), '');
	});

	test('does not add PHP context after a closing tag', () => {
		const source = '<?php echo "PHP"; ?>\n<div>HTML</div>';
		const selectionStart = source.indexOf('<div>');

		assert.strictEqual(getSyntaxPrefix('php', source, selectionStart), '');
	});

	test('does not add context to other languages', () => {
		assert.strictEqual(getSyntaxPrefix('typescript', 'const value = 1;', 0), '');
	});

	test('uses JavaScript mode for a fragment inside a script tag', () => {
		const source = '<script>\nconst first = 1;\nnuevaSesion() {}\n</script>';
		const selectionStart = source.indexOf('nuevaSesion');

		assert.deepStrictEqual(getSyntaxContext('php', source, selectionStart), {
			languageId: 'separate-javascript',
			prefix: ''
		});
	});

	test('uses the language declared by embedded tag attributes', () => {
		const source = '<script lang="ts">\nconst value: number = 1;\n</script>';
		const selectionStart = source.indexOf('const');

		assert.strictEqual(getSyntaxContext('vue', source, selectionStart).languageId, 'separate-typescript');
	});

	test('stops using an embedded language after its closing tag', () => {
		const source = '<script>const value = 1;</script>\n<div>HTML</div>';
		const selectionStart = source.indexOf('<div>');

		assert.strictEqual(getSyntaxContext('php', source, selectionStart).languageId, 'separate-php');
	});

	test('ignores script-like strings inside PHP code', () => {
		const source = '<?php\n$html = "<script>";\nrunTask();';
		const selectionStart = source.indexOf('runTask');

		assert.deepStrictEqual(getSyntaxContext('php', source, selectionStart), {
			languageId: 'separate-php',
			prefix: ''
		});
	});
});
