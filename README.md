
# combell-api

[![Greenkeeper badge](https://badges.greenkeeper.io/LoicMahieu/combell-api.svg)](https://greenkeeper.io/)

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
- `listA`
