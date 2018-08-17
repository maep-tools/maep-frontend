### Frontend config
Se debe de editar el archivo index.html y buscar las siguientes instrucciones:

Es necesario cambiar el path base con la URL del servidor.

window.pathBase = 'http://127.0.0.1'
Es necesario poner el puerto de la aplicación del backend laravel. Por defecto será el puerto 80.

window.portBaseLaravel = '8000'

Si queremos probar funciones experimentales para la generación de viento debemos ejecutar el siguiente programa.

window.enableWindGeneration = false

Si queremos mostrar resultados con gráficas. Debemos seleccionar la siguiente variable de entorno.

window.enableResults = true

Si desea cambiar la ruta de la documentación del sistema debe cambiar el archivo pdf ubicado en:

/static/doc.pdf


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
