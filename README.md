Stream Box is a free, open source, movie streaming application

## Building from source

[Install GIT](https://git-scm.com/)

[Install Node/NPM](https://nodejs.org)

`npm i -g electron-builder`

```
git clone https://github.com/RedDuckss/stream-box
cd stream-box
npm i
electron-builder -w[l[m]]
```

Use flag `w` to build for Windows, `l` to build for Linux and/or `m` to build for Mac, or any combination to build for multiple targets. Will build to `./dist`

[preview](https://i.imgur.com/D8k0M8N.gif)

### Todo List
- [x] Movie search
- [x] TV Show search
- [x] Movie scraping
- [x] TV Show scraping
- [ ] Stream selection
- [ ] Gamepad support (PS3/4, Xbox, etc)
- [x] Support for the OSMC remote control