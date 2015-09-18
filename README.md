
# combell-api

## Example

```
var Combell = require('./src/combell');
var client = new Combell('login', 'password');

client
  .login()
  .then(function () {
    return client.listDomains();
  })
  .then(console.log)
  .catch(console.error);
```

## Methods

- `login`
- `listDomains`
- `listCNAME`
