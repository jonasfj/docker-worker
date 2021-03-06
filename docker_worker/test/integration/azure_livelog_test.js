suite('azure logging', function() {
  if (!process.env.AZURE_STORAGE_ACCOUNT) {
    test.skip(
      'azure logging test disabled env: AZURE_STORAGE_ACCOUNT missing'
    );
    return;
  }

  var request = require('superagent-promise');
  var testworker = require('../testworker');

  test('azure logger', function() {
    return testworker.submitTaskAndGetResults({
      image:          'ubuntu',
      command:        ['/bin/bash', '-c', 'echo "first command!"'],
      features: {
        bufferLog:    true,
        azureLivelog: true
      }
    }).then(function(data) {
      // Get task specific results
      var result = data.result.result;
      assert.equal(result.exitCode, 0);
      assert.ok(result.logText.indexOf('first') !== -1);

      // Get the logs.json
      var logs = data.logs;

      // Lookup in the logs map inside logs.json
      var azure_log = logs.logs['terminal.log'];
      assert.ok(azure_log !== undefined);

      // Fetch log from azure
      request('GET', azure_log).end().then(function(req) {
        // Check that it's equal to logText from buffer log
        assert.equal(req.res.text, result.logText);
      });
    });
  });
});
