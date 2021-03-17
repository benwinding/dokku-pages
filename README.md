# dokku-pages
<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/dokku-pages.svg)](https://www.npmjs.com/package/dokku-pages) 
[![License](https://img.shields.io/npm/l/dokku-pages.svg)](https://github.com/benwinding/dokku-pages/blob/master/LICENSE) 
[![Downloads/week](https://img.shields.io/npm/dm/dokku-pages.svg)](https://www.npmjs.com/package/dokku-pages) 
[![Github Issues](https://img.shields.io/github/issues/benwinding/dokku-pages.svg)](https://github.com/benwinding/dokku-pages)
<!-- [END badges] -->

A simple way to deploy a static site to [dokku](https://github.com/dokku/dokku).

## Get Started

### Installation
```
npm i -g dokku-pages
```
### Usage
```
dokku-pages deploy -g dokku@mysite.com:myapp -p dist
```
### Minimal Containers
By adding the `--minimal` flag, you can dramatically decrease container footprint.

| Deploy Command        | Dokku Type | Image Size  |
| ------------- | --- | ------------- |
| `deploy ...` | Herokuish Build Pack | 1.5 GB |
| `deploy ... --minimal` | Docker Build | 55 MB |

That's a saving of `96.4%`!

### Help
```
Usage: dokku-pages [options] [command]

Options:
  -h, --help        display help for command

Commands:
  deploy [options]  Deploys this library to your dokku
    -g, --giturl <giturl>   The dokku git url (eg: user@host:app)
    -d, --dist <directory>  The static directory
    --minimal               Use minimal docker image instead of herokuish buildpack
    --allow-cors <domains>  Allow CORS for a domain (example.com or *)
    --dry-run               Only build the image, won't deploy to dokku
    -h, --help              display help for command

  help [command]    display help for command

```

### CORS on certain paths

Cors configuration is only available with the flag `--minimal`.

```
CORS Example Arguments:
  --allow-cors '*'                ANY domain
  --allow-cors 'a1.com'           a1.com OR www.a2.com
  --allow-cors 'a1.com|a2.com'    a1.com OR a2.com
  --allow-cors '.+\.example.com'  ANY subdomain of example.com
  --allow-cors 'localhost:.+'     ANY port on localhost
```

## Notes

- This requires:
  - npm
  - git
  - ssh
- You need to have ssh access to the dokku instance
- The app needs to exist on the dokku instance

## Inspiration

This package is inspired by the ease of use of [gh-pages](https://www.npmjs.com/package/gh-pages)
