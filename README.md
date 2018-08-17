
<p align="center">
    <img width="460" height="300" src="https://maep-tools.github.io/landing-page/assets/img/theme/Vector.svg">
</p>

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




### License
----
MIT
Copyright 2018 MAEP

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




