### Frontend config
You need to edit the index.html file and search the next instructions:
Please change the path with the backend server url.
```
window.pathBase = 'http://127.0.0.1'
```
You can change the port of the project.
```
window.portBaseLaravel = '8000'
```
If you want to test experimental functions for the wind generator you need to run:
```
window.enableWindGeneration = false
```
If you want show results with charts. You need to enable this:
By default this is disabled because is a experimiental tool.
```
window.enableResults = true
```
If you need to change the path of the documentation you need to change the document in this path.
```
/static/doc.pdf
```

### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
