import Vue from 'vue'
import VueRouter from 'vue-router'
import { mapMutations, mapActions, mapState } from 'vuex'
import { cloneDeep, isEmpty } from 'lodash'
import store from './store'

import '../node_modules/todomvc-app-css/index.css'
// import './styles/styles.scss'
Vue.use(VueRouter)

// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.

// visibility filters
const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.completed),
  completed: todos => todos.filter(todo => todo.completed)
}

const router = new VueRouter({
  routes: [
    {path: '/:filterBy'} //normally we have a component but its not required, just want $route.params
  ]
})

// app Vue instance
var app = new Vue({
  store,
  router,
  // app initial state
  data: {
    editingTodo: {},
    visibility: 'all'
  },

  // watch todos change for localStorage persistence
  watch: {
    '$route': function () {
      console.log('filterBy', this.$route.params.filterBy)
      this.visibility = this.$route.params.filterBy
    }
  },

  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    ...mapState([
      'activeItem',
      'errors'
    ]),
    todos () {
      return this.$store.state.items
    },
    allChecked () {
      return this.todos.every(todo => todo.completed)
    },
    filteredTodos () {
      return filters[this.visibility](this.todos)
    },
    remaining () {
      return this.todos.filter(todo => !todo.completed).length
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items'
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    ...mapMutations([
      '$updateErrors',
      '$setActiveItem'
    ]),
    ...mapActions([
      'insert',
      'update',
      'remove',
      'removeCompleted',
      'toggleAll',
      'toggleCompleted'
    ]),
    addTodo (e) {
      if(!e.target.value.trim()) return

      let newTodo = {
        title: e.target.value.trim(),
        completed: false
      }

      this.insert(newTodo).then(() => {
        e.target.value = ''
      })
    },
    editTodo(todo) {
      this.editingTodo = cloneDeep(todo)
      this.$setActiveItem(todo)
      //this.$store.commit('SET_ACTIVE_ITEM', todo) //<- could be dont like this too
      console.log("editTodo activeItem", this.activeItem)
    },
    doneEdit () {
      const {editingTodo, activeItem} = this
      console.log("doneEdit", editingTodo)
      if (isEmpty(activeItem)) return //prevents the other events from firing

      this.update({ item: activeItem, changes: editingTodo }).then(() => {
        this.resetEdit()
      }).catch(e => {
        console.log("doneEdit error", e)
      })
    },
    resetEdit (todo, e) {
      this.editingTodo = {}
      this.$setActiveItem({})
      this.$updateErrors({ message: '' })
    }
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    'todo-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  },

  created: function() {
    console.log("Ready")
    this.$store.dispatch('list')
    //ensures its properly set
    if(this.$route.params.filterBy) this.visibility = this.$route.params.filterBy
  }
})

// mount
app.$mount('.todoapp')
