
<p align="center">
    <img width="230" height="150" src="https://maep-tools.github.io/interface-landingpage/assets/img/theme/Vector.svg">
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

### Screenshots
#### Dashboard
You can see the status of the model in this page. The users can create models in the application only using a web browser.
Is perfect if you are a basic user. 
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/dashboard.png)


#### User management
The administrator can see the users registered in the system. You can configure a lot of roles.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/users.png)


#### Excel Upload
You can upload the inputs of MAEP from the UI and the system send you a email when the process finish.
![Excel](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/excel.png)


#### User Interface for learn the inputs of MAEP
We design a custom user interface for learn how to use MAEP
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/demand.png)

hundreds of configuration variables categorized.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/form.png)


#### Email notification
The system send a notification to the user email address when the model is processed.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/email.png)

#### Queue system
You can close the window. And the model will finish in the background.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/loading.png)

Check your email address later.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/queue1.png)

#### Input Validation Screen
You can see if your model is ready to run.
![Dashboard](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/validation.png)

#### Results
You can configure the results page. Maybe you want to see a list of charts.
![Results1](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/results.png)

Maybe you only need serve the output. 
![Results2](https://raw.githubusercontent.com/maep-tools/maep-documentation/master/screenshots/results2.png)



### License
----
MIT
Copyright 2018 MAEP

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




