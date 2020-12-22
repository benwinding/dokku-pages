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

### Per Project Usage

Add it to your project
```
npm install -D dokku-pages
```
In your `package.json`
``` json
{
  "scripts": {
    ...,
    "deploy": "dokku-pages deploy -g dokku@mysite.com:myapp -p dist"
    ...,
  }
}
```

### Help
```
Usage: dokku-pages [options] [command]

Options:
  -h, --help        display help for command

Commands:
  deploy [options]  Deploys this library to your dokku
  help [command]    display help for command
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