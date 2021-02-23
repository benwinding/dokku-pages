# dokku-pages

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
    --allow-cors <domain>   Allow CORS for a domain (example.com or *)
    -h, --help              display help for command

  help [command]    display help for command

```

### CORS on certain paths

This library uses the same configuration file that [Google Cloud uses](https://cloud.google.com/storage/docs/gsutil/commands/cors). 

Save a json file in the folder that `dokku-pages` is run in, with the following example.

```

```

To give ALL domains CORS access (not advised), you can use:

```
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
