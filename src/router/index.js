import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Login from '@/components/Login'
import Process from '@/components/Process'
import Users from '@/components/Users'
import Profile from '@/components/Profile'
import Roles from '@/components/Roles'
import Answers from '@/components/Answers'
import Terms from '@/components/Terms'
import DeleteAccount from '@/components/DeleteAccount'
import User from '@/components/User'
import Admin from '@/components/Admin'
import UserModel from '@/components/UserModel'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      meta: {auth: true},
      name: 'main',
      component: Main
    },
    {
    	path: '/login/:id?',
    	meta: {auth: false},
    	name: 'login',
    	component: Login
    },
    {
      path: '/process/:id?',
      meta: {auth: true},
      name: 'process',
      component: Process
    },
    {
      path: '/users',
      meta: {
          auth: {
            roles:['seeUsers'],
            forbiddenRedirect: '/'
          }
      },
      name: 'users',
      component: Users
    },
    {
      path: '/profile',
      meta: {auth: true},
      name: 'profile',
      component: Profile
    },
    {
      path: '/roles',
      meta: {
          auth: {
            roles:['seeRoles'],
            forbiddenRedirect: '/'
          }
      },
      name: 'roles',
      component: Roles
    },
    {
      path: '/terms',
      meta: {auth: true},
      name: 'terms',
      component: Terms
    },
    {
      path: '/answers',
      meta: {auth: true},
      name: 'answers',
      component: Answers
    },
    {
      path: '/delete-account',
      meta: {auth: true},
      name: 'deleteAccount',
      component: DeleteAccount
    },
    {
      path: '/user/:id?',
      meta: {
          auth: {
            roles:['seeUser'],
            forbiddenRedirect: '/'
          }
      },
      name: 'user',
      component: User
    },
    {
      path: '/admin',
      meta: {
          auth: {
            roles:['administrate'],
            forbiddenRedirect: '/'
          }
      },
      name: 'admin',
      component: Admin
    },
    {
      path: '/user/:id?/models',
      meta: {
          auth: {
            roles:['seeUserModels'],
            forbiddenRedirect: '/'
          }
      },
      name: 'userModel',
      component: UserModel
    }
  ]
})
