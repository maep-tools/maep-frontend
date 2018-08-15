<template>
<div class="container">
  <div class="row mt-5">
    <div class="col-md-6">
      <h3><i class="tasks icon circular inverted blue"></i> ADMINISTRAR CONTENIDO</h3>
      <div id="main-offer-form">
        <div class="form-group required">
          <label class="control-label">Nombre de la categoría</label>
          <input v-model="category.name"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Nombre*"
                 required="">
        </div>


        <div class="form-group required">
          <label class="control-label">Componente asociado</label>
          <input v-model="category.component"
                 type="text"
                 name="component"
                 class="form-control"
                 placeholder="Nombre*"
                 required="">
        </div>


      </div>
      <el-switch style="display: block"
                 v-model="category.disabled"
                 active-color="#13ce66"
                 inactive-color="#ff4949"
                 active-text="Activa"
                 inactive-text="Inactiva">
      </el-switch>
      <hr>
      <button @click="save()"
              class="btn btn-dark">
        <i class="icon sitemap"></i> Guardar
      </button>
      <button @click="remove(category.id)"
              class="btn btn-danger"><i class="icon trash"></i> Eliminar</button>
      <hr>
      <div id="main-offer-form"
           v-if="category.name !== ''">
        <div class="form-group required">
          <label class="control-label">Agregar un hijo</label>
          <input v-model="subcategory.name"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Nombre*"
                 required="">
        </div>

        <div class="form-group required">
          <label class="control-label">Componente asociado</label>
          <input v-model="subcategory.component"
                 type="text"
                 name="component"
                 class="form-control"
                 placeholder="Nombre*"
                 required="">
        </div>


      </div>
      <el-switch style="display: block"
                 v-model="subcategory.disabled"
                 active-color="#13ce66"
                 inactive-color="#ff4949"
                 active-text="Activa"
                 inactive-text="Inactiva">
      </el-switch>
      <hr>
      <button v-if="category.name !== ''"
              @click="add()"
              class="btn btn-primary">
        <i class="save icon"></i> Guardar
      </button>
    </div>
    <div class="col-md-6">
      <el-tree default-expand-all
               class="filter-tree"
               :data="categories"
               :props="defaultProps"
               @node-click="handleNodeClick"
               :filter-node-method="filterNode"
               ref="tree2">
      </el-tree>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../api/process.js';
import q from 'q';

export default {
  /* Nombre del componente */
  name: 'Main',
  /* Propiedades que recibe */
  props: [
    'data'
  ],
  /* Constructor */
  mounted() {
    this.categories = this.data
    this.category = this.categories[0]
  },
  /* Metodos publicos */
  methods: {
    /* 
    * Acción que se ejecuta al eliminar del arbol
    */
    deleteFromTree() {
      const parent = this.parent

      const children = parent.parent.data.children || parent.parent.data
      const index = children.findIndex(d => d.id === this.category.id)
      children.splice(index, 1)
    },
    /* 
    * Acción que elimina un elemento del arbol
    */
    remove(id) {
      if (this.category.parentId !== -1) {
        api.deleteCategory(id).then(() => {
          this.deleteFromTree()
          this.$message({
            type: 'success',
            message: 'La eliminación se ha realizado con exito.'
          })
        })
      } else {
        this.$message({
          type: 'warning',
          message: 'No podemos eliminar la categoría padre'
        })
      }

    },
    /* 
    * Permite actualizar una categoria
    */
    save() {
      if (this.validateCategory()) {
        api.updateCategory(this.category).then((r) => {
          this.$message({
            type: 'success',
            message: 'La categoria se modifico con exito'
          })
        })
      }
    },
    /* 
    * Permite validar que se puede insertar una categoria
    */
    validateCategory() {
      if (this.category.name === '') {
        this.$message({
          type: 'error',
          message: 'La categoria debe de tener un nombre'
        })
        return
      }
      return true
    },
    /* 
    * Permite filtrar categorias
    */
    filterNode(value, data) {
      if (!value) {
        return true
      }
      return data.name.indexOf(value) !== -1
    },
    /* 
    * Acción que se ejecuta al hacer click en un nodo
    */
    handleNodeClick(data, node) {
      this.parent = node
      this.selectedNode = data
      this.category = data
    },
    /* 
    * Permite agregar una categoria
    */
    add() {
      if (this.subcategory.name !== '' && !_.isNil(this.subcategory.name)) {
        this.subcategory.parentId = this.category.id
        api.createCategory(this.subcategory).then((response) => {
          if (_.isNil(this.category.children)) {
            this.$set(this.category, 'children', [])
          }

          this.category.children.push(this.subcategory)
          this.subcategory = {}
        })
      } else {
        this.$message({
          type: 'warning',
          message: 'El nombre esta vacio.'
        })
      }

    }
  },
  /* 
  * Estado de datos inicial.
  */
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      selectedNode: {},
      category: {
        name: '',
        parentId: '',
        disabled: true
      },
      subcategory: {
        name: '',
        parentId: '',
        disabled: true,
        order: 0
      },
      categories: []
    }
  }
}

</script>
