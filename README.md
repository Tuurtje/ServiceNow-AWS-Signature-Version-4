# ServiceNow-AWS-Signature-Version-4

Usefull to make a direct API call to AWS from ServiceNow!

Import both scripts in 'Script includes'. The example below can be run from a workflowtask or 'script - Backend

Example for SecretManager
```
var method = 'POST';
var service = 'secretsmanager';
var amz_target = 'secretsmanager.GetSecretValue';
var host = 'secretsmanager.eu-central-1.amazonaws.com';
var region = 'eu-central-1';
var endpoint = 'https://secretsmanager.eu-central-1.amazonaws.com';
var access_key = '<access_key>'
var secret_key = '<secret_key>'
var canonical_uri = '/';
var canonical_querystring = '';
var request_body = '{"SecretId": "<secretName>"}';

response = AWS_API_Call.execute(method, service, amz_target, host, region, endpoint, access_key, secret_key, canonical_uri, canonical_querystring, request_body);
gs.print(response);
```