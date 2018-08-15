
import axios from 'axios'
import config from '../config'

// demands
// fuel-cost-plants
// fuel-cost-horizonts
// entrance_stages
// types
// thermal-configs
// thermal-expns
// rationing-costs
// small-configs
// small-expns
// hidro-configs
// hidro-expns
// inflow'
// wind-configs
// wind-expns


export default {

    getErrorsBackend (processId) {
        return axios.get('results/getErrors/' + processId);
    },

    getLogsBackend (processId) {
        return axios.get('results/getLogs/' + processId);
    },

    getChartsByArea (processId) {
        return axios.get('/results/getAreasChart/' + processId);
    },

    getChartsGeneral (processId) {
        return axios.get('/results/getMainChart/' + processId)
    },
    getTemplates () {
        return axios.get('getTemplates')
    },

    getValidation (id) {
        return axios.get('validateProcess/' + id)
    },


    getMonths () {
        return axios.get('/months')
    },




    /*
    * Permite modificar configuración por identificador del proceso
    */
    createLinesExpansion (data) {
        return axios.post('/lines-expansion', data)        
    },
    /*
    * Permite modificar configuración por identificador del proceso
    */
    updateLinesExpansion (id, data) {
        return axios.put('/lines-expansion/' + id, data)        
    },
    /*
    * Permite eliminar una configuración
    */
    deleteLinesExpansion (id) {
        return axios.delete('/lines-expansion/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getLinesExpansion (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/lines-expansion/', {
            params: {
                with: 'initial;final;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },









    /*
    * Permite modificar configuración por identificador del proceso
    */
    createLines (data) {
        return axios.post('/lines', data)        
    },
    /*
    * Permite modificar configuración por identificador del proceso
    */
    updateLines (id, data) {
        return axios.put('/lines/' + id, data)        
    },
    /*
    * Permite eliminar una configuración
    */
    deleteLines (id) {
        return axios.delete('/lines/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getLines (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/lines/', {
            params: {
                with: 'initial;final',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },







    /*
    * Permite modificar configuración por identificador del proceso
    */
    createStorageExpansion (data) {
        return axios.post('/storage-expansion', data)        
    },
    /*
    * Permite modificar configuración por identificador del proceso
    */
    updateStorageExpansion (id, data) {
        return axios.put('/storage-expansion/' + id, data)        
    },
    /*
    * Permite eliminar una configuración
    */
    deleteStorageExpansion (id) {
        return axios.delete('/storage-expansion/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getStorageExpansion (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/storage-expansion/', {
            params: {
                with: 'StorageConfig;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },




    /*
    * Permite modificar configuración por identificador del proceso
    */
    createStorageConfig (data) {
        return axios.post('/storage-config', data)        
    },
    /*
    * Permite modificar configuración por identificador del proceso
    */
    updateStorageConfig (id, data) {
        return axios.put('/storage-config/' + id, data)        
    },
    /*
    * Permite eliminar una configuración
    */
    deleteStorageConfig (id) {
        return axios.delete('/storage-config/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getStorageConfig (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/storage-config/', {
            params: {
                with: 'areas;entranceStages',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },











    removePowCurve (id) {
        return axios.delete('w-pow-curve-m2/' + id)
    },

    /*
    * Permite guardar curvas de potencia
    */
    updateWPowCurve (id, data) {
        return axios.put('w-pow-curve-m2/' + id, data)
    },

    /*
    * Permite guardar curvas de potencia
    */
    saveWPowCurve (data) {
        return axios.post('w-pow-curve-m2', data)
    },

    /*
    * Permite obtener la curva de potencia
    */
    getWPowCurve (id) {
        return axios.get('getWPowCurveByWindConfigM2Id/' + id)
    },

    /*
    * Permite cambiar el segmento por defecto
    */
    changeSelectedSegment (data) {
        return axios.put('select-segment', data)
    }, 


    /*
    * Permite crear speed indices
    */
    createInflow (data) {
        return axios.post('/inflow', data)  
    },
    /*
    * Permite modificar speed indices
    */
    updateInflow (id, data) {
        return axios.put('/inflow/' + id, data)        
    },
    /*
    * Permite obtener speed indices
    */
    getInflowByHydroConfigId (windConfigId) {
        return axios.get('/getInflowByHydroConfigId/' + windConfigId)
    },
    /*
    * Permite eliminar speed indices
    */
    deleteInflow (id) {
        return axios.delete('/inflow/' + id)

    },




    /*
    * Permite crear speed indices
    */
    createInflowWindM2 (data) {
        return axios.post('/inflow-wind-m2', data)  
    },
    /*
    * Permite modificar speed indices
    */
    updateInflowWindM2 (id, data) {
        return axios.put('/inflow-wind-m2/' + id, data)        
    },
    /*
    * Permite obtener speed indices
    */
    getInflowWindByIdM2 (windConfigId) {
        return axios.get('/getInflowWindByWindConfigIdM2/' + windConfigId)
    },
    /*
    * Permite eliminar speed indices
    */
    deleteInflowWindM2 (id) {
        return axios.delete('inflow-wind-m2' + id)

    },















    /*
    * Permite crear speed indices
    */
    createInflowWind (data) {
        return axios.post('/inflow-wind', data)  
    },
    /*
    * Permite modificar speed indices
    */
    updateInflowWind (id, data) {
        return axios.put('/inflow-wind/' + id, data)        
    },
    /*
    * Permite obtener speed indices
    */
    getInflowWindById (windConfigId) {
        return axios.get('/getInflowWindByWindConfigId/' + windConfigId)
    },
    /*
    * Permite eliminar speed indices
    */
    deleteInflowWind (id) {
        return axios.delete('/inflow-wind/' + id)

    },


    /*
    * Permite modificar una area por identificador del proceso
    */
    createScenario (data) {
        return axios.post('/scenario', data)        
    },
    /*
    * Permite modificar una area por identificador del proceso
    */
    updateScenario (id, data) {
        return axios.put('/scenario/' + id, data)        
    },
    /*
    * Permite eliminar un area
    */
    deleteScenario (id) {
        return axios.delete('/scenario/' + id)
    },
    /*
    * Permite traer todas las scenario por identificador de proceso
    */
    getScenarios (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/scenario/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='
            }
        })
    },




    /*
    * Permite crear speed indices
    */
    createSpeedIndicesM2 (data) {
        return axios.post('/speed-indices-m2', data)  
    },
    /*
    * Permite modificar speed indices
    */
    updateSpeedIndicesM2 (id, data) {
        return axios.put('/speed-indices-m2/' + id, data)        
    },
    /*
    * Permite obtener speed indices
    */
    getSpeedIndicesByIdM2 (windConfigId) {
        return axios.get('/getSpeedIndicesByWindConfigId-m2/' + windConfigId)
    },
    /*
    * Permite eliminar speed indices
    */
    deleteSpeedIndicesM2 (id) {
        return axios.delete('/speed-indices-m2/' + id)
    },








    /*
    * Permite crear speed indices
    */
    createSpeedIndices (data) {
        return axios.post('/speed-indices', data)  
    },
    /*
    * Permite modificar speed indices
    */
    updateSpeedIndices (id, data) {
        return axios.put('/speed-indices/' + id, data)        
    },
    /*
    * Permite obtener speed indices
    */
    getSpeedIndicesById (windConfigId) {
        return axios.get('/getSpeedIndicesByWindConfigId/' + windConfigId)
    },
    /*
    * Permite eliminar speed indices
    */
    deleteSpeedIndices (id) {
        return axios.delete('/speed-indices/' + id)
    },




    /*
    * Permite crear pequeñas configuraciones
    */
    createWindM2Config (data) {
        return axios.post('/windM2Config', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateWindM2Config (id, data) {
        return axios.put('/windM2Config/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getWindM2Config (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/windM2Config',{
            params: {
                with: 'areas;entranceStages',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteWindM2Config (id) {
        return axios.delete('/windM2Config/' + id)
    },





    /*
    * Permite crear pequeñas configuraciones
    */
    createBlock (data) {
        return axios.post('/blocks', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateBlock (id, data) {
        return axios.put('/blocks/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getBlocks (processId) {
        var query = 'process_id:' + processId
        return axios.get('/blocks', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='
            }

        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteBlock (id) {
        return axios.delete('/blocks/' + id)
    },





    /*
    * Permite crear pequeñas configuraciones
    */
    createWindConfigExpansion (data) {
        return axios.post('/wind-expansion', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateWindConfigExpansion (id, data) {
        return axios.put('/wind-expansion/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getWindExpansion (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/wind-expansion', {
            params: {
                with: 'windConfig;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteWindConfigExpansion (id) {
        return axios.delete('/wind-expansion/' + id)
    },





    /*
    * Permite crear pequeñas configuraciones
    */
    createWindConfig (data) {
        return axios.post('/wind-config', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateWindConfig (id, data) {
        console.log(data)
        return axios.put('/wind-config/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getWindConfig (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/wind-config', {
            params: {
                with: 'areas;entranceStages',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteWinConfig (id) {
        return axios.delete('/wind-config/' + id)
    },














    /*
    * Permite crear pequeñas configuraciones
    */
    createHydroExpansionConfig (data) {
        return axios.post('/hydro-expansion', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateHydroConfigExpansion (id, data) {
        return axios.put('/hydro-expansion/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getHydroExpansion (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/hydro-expansion', {
            params: {
                with: 'hydroConfig;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteHydroExpansionConfig (id) {
        return axios.delete('/hydro-expansion/' + id)
    },







    /*
    * Permite crear pequeñas configuraciones
    */
    createHydroConfig (data) {
        return axios.post('/hydro-config', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateHydroConfig (id, data) {
        return axios.put('/hydro-config/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getHydroConfig (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/hydro-config', {
            params: {
                with: 'areas;entranceStages;type',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteHydroConfig (id) {
        return axios.delete('/hydro-config/' + id)
    },










    createSmallConfigExpansion (data) {
        return axios.post('/small-config-expansion', data)  
    },
    updateSmallConfigExpansion (id, data) {
        return axios.put('/small-config-expansion/' + id, data)        
    },
    getSmallConfigExpansion (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/small-config-expansion', {
            params: {
                with: 'SmallConfig;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteSmallConfigExpansion (id) {
        return axios.delete('/small-config-expansion/' + id)
    },    
    /*
    * Permite crear pequeñas configuraciones
    */
    createSmallConfig (data) {
        return axios.post('/small-config', data)  
    },
    /*
    * Permite modificar una pequeña configuración
    */
    updateSmallConfig (id, data) {
        return axios.put('/small-config/' + id, data)        
    },
    /*
    * Permite obtener una pequeña modificacion
    */
    getSmallConfig (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/small-config', {
            params: {
                with: 'areas;entranceStages;type',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite eliminar una configuración
    */
    deleteSmallConfig (id) {
        return axios.delete('/small-config/' + id)
    },









    createRationingCost (data) {
      return axios.post('/rationing-costs', data)        
    },
    updateRationingCost (id, data) {
        return axios.put('/rationing-costs/' + id, data)        
    },
    getRationingCostBySegmentId (id) {
        return axios.get('getRationingCostBySegmentId/' + id)
    },
    createThermalConfigExpansion (data) {
        return axios.post('/thermal-expansion', data)  
    },
    updateThermalConfigExpansion (id, data) {
        return axios.put('/thermal-expansion/' + id, data)        
    },
    getThermalConfigExpansion (processId) {
        console.log('santiago')
        var query = 'process_id:' + processId + ';'
        return axios.get('/thermal-expansion', {
            params: {
                with: 'ThermalConfig;horizont',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    deleteThermalConfigExpansion (id) {
        return axios.delete('/thermal-expansion/' + id)
    },
    updateFuelCostHorizont (id, data) {
        return axios.put('/fuel-cost-horizonts/' + id, data)        
    },
    createFuelCostHorizont (data) {
      return axios.post('/fuel-cost-horizonts', data)        
    },
    /*
    * Permite traer todos los costos de fuel por id
    */
    getFuelCostByFuelId (id) {
        return axios.get('getFuelCostHorizontsByFuelId/' + id)
    },
    /*
    * Permite modificar un segmento
    */
    createSegment (data) {
        return axios.post('/segments', data)        
    },
    /*
    * Permite modificar segmento
    */
    updateSegment (id, data) {
      return axios.put('/segments/' + id, data)        
    },
    /*
    * Permite eliminar el segmento
    */
    deleteSegment (id) {
      return axios.delete('/segments/' + id)        
    },
    /*
    * Permite traer todos los segmentos
    */
    getSegments (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/segments/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='
            }
        })
    },
    /*
    * Permite modificar una area por identificador del proceso
    */
    createFuel (data) {
        return axios.post('/fuel', data)        
    },
    /*
    * Permite modificar fuel
    */
    updateFuel (id, data) {
      return axios.put('/fuel/' + id, data)        
    },
    /*
    * Permite eliminar el fuel
    */
    deleteFuel (id) {
      return axios.delete('/fuel/' + id)        
    },
    /*
    * permite traer todos los combustibles
    *
    */
    getCombustiblesByProcessId (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/fuel/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        }) 
    },
    /*
    * permite eliminar un horizonte por id
    *
    */
    deleteHorizontById (id) {
        return axios.delete('horizonts/' + id)
    },
    updateHorizont (processId, data) {
        return axios.put('horizonts/' + processId, data)
    },
    deleteHorizontByProcessId (processId) {
        return axios.delete('delete-horizont-by-processId/' + processId)
    },
    getDemandByArea (areaId) {
        return axios.get('get-by-area/' + areaId)
    },
    createHorizont (data) {
      return axios.post('/horizonts', data)        
    },

    getHorizontByProcessId (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/horizonts/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:=',
                orderBy:'period'             
            }
        })        
    },


    /*
    * Permite traer tipos
    */
    getTypes() {
        return axios.get('/types/')
    },
    /*
    * Permite traer entrance stages
    */
    getEntranceStages() {
        return axios.get('/entrance-stages/')
    },

    /*
    * Permite traer los datos de demanda
    */
    getDemand(processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/demands/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },

    createDemand (data) {
        return axios.post('/demands', data)        
    },


    updateDemand (id, data) {
        return axios.put('/demands/' + id, data)        
    },


/**
 *
 * OJO ESTOS NO ESTAN DESARROLLADOS
 *
 */



    /*
    * Permite crear expansion de viento por identificador del proceso
    */
    createWindExpns (data) {
        return axios.post('/wind-expns', data)        
    },
    /*
    * Permite modificar por identificador del proceso
    */
    updateWindExpns (id, data) {
        return axios.put('/wind-expns/' + id, data)        
    },
    /*
    * Permite eliminar una wind expansion
    */
    deleteWindExpns (id) {
        return axios.delete('/wind-expns/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getWindExpns(processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/wind-expns/', {
            params: {
                with: 'areas',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite descargar windexpansion existentes en formato excel.
    */
    donwloadWindExpns(idProcess, input) {
        return axios.post('/wind-expns/generateExcel/' + idProcess, input);
    },
    /*






    /*
    * Permite modificar configuración por identificador del proceso
    */
    createThermalConfig (data) {
        return axios.post('/thermal-configs', data)        
    },
    /*
    * Permite modificar configuración por identificador del proceso
    */
    updateThermalConfig (id, data) {
        return axios.put('/thermal-configs/' + id, data)        
    },
    /*
    * Permite eliminar una configuración
    */
    deleteThermalConfig (id) {
        return axios.delete('/thermal-configs/' + id)
    },
    /*
    * Permite traer todas las configuraciones termales por identificador de proceso
    */
    getThermalConfig (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/thermal-configs/', {
            params: {
                with: 'areas;entranceStages;fuel;type',
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='              
            }
        })
    },
    /*
    * Permite descargar las areas existentes en formato excel.
    */
    donwloadExcelThermalConfig(idProcess, input) {
        return axios.post('/thermalConfig/generateExcel/' + idProcess, input);
    },
    /*
    * Permite modificar una area por identificador del proceso
    */
    createArea (data) {
        return axios.post('/areas', data)        
    },
    /*
    * Permite modificar una area por identificador del proceso
    */
    updateArea (id, data) {
        return axios.put('/areas/' + id, data)        
    },
    /*
    * Permite eliminar un area
    */
    deleteArea (id) {
        return axios.delete('/areas/' + id)
    },
    /*
    * Permite traer todas las areas por identificador de proceso
    */
    getAreas (processId) {
        var query = 'process_id:' + processId + ';'
        return axios.get('/areas/', {
            params: {
                search: query,
                searchJoin: 'and',
                searchFields: 'process_id:='
            }
        })
    },
    /*
    * Permite descargar las areas existentes en formato excel.
    */
    donwloadExcelAreas(idProcess, input) {
        return axios.post('/areas/generateExcel/' + idProcess, input);
    },
    updateCategory (model) {
        return axios.put('/categories/' + model.id, model)
    },
    createCategory (model) {
        return axios.post('/categories', model)
    },
    deleteCategory (id) {
        return axios.delete('/categories/' + id)
    },
    getCategories () {
        return axios.get('/categories')
    },
    clearLogs (log) {
        return axios.get('/clear-logs/' + log)
    },
    validateEmail (email) {
        return axios.get('/auth/validate/' + email)
    },
    processNew (id) {
        return axios.post('/process/' + id)
    },
    updateUser (user) {
        return axios.put('users/' + user.id, user)
    },
    getUser (id) {
        return axios.get('users/' + id)
    },
    removeRol (id) {
        return axios.delete('roles/' + id)
    },
    createRol (model) {
        return axios.post('roles', model)
    },
    updateRol (id, model) {
        return axios.put('roles/' + id, model)
    },
    getRoles () {
        return axios.get('roles')
    },
    downloadExcel () {
        return axios.post('users/download-excel')
    },
    getUsers(limit, offset, page, state, search) {
        var query = state
        var fields = 'email:like'
        if (search !== '') {
            query = 'email:' + search + ';' + 'name:' + search + ';lastname:' + search + ';meta.company:' + search + ';meta.phone:' + search
            fields += ';name:like;lastname:like;meta.company:like;meta.phone:like;'
        }

        return axios.get('users', {
            params: {
                per_page: limit,
                limit: limit,
                offset: offset,
                page: page,
                search: query,
                searchJoin: 'or',
                searchFields: fields,
                with: 'roles;meta'
            }
        });
    },
    deleteUser(id) {
        return axios.delete('users/' + id)
    },
    register(model) {
        return axios.post('/auth/register', model)
    },
    addCurrentConnection(context) {
        context.$socket.emit('connected', {
            user: context.$auth.user(),
            date: new Date()
        });
    },
    reset(email) {
        return axios.post('/auth/password/email', {
            email: email
        })
    },
    resetPassword(form) {
        return axios.post('/auth/password/reset', form)
    },
    sendToken() {
        return axios.get('/auth/activate/send-token')
    },
    getProcess(limit, offset, page, state, search, userId) {
        var query = 'statusId:' + state + ';' 
        var fields = 'statusId:=;'
        
        if (userId) {
            query += 'userId:' + userId
            fields += 'userId:=;';
        }
        
        if (search !== '') {
            query = 'statusId:' + state + ';' + 'name:' + search
            fields += ';name:like;userId:='

        }

        return axios.get('processes', {
            params: {
                per_page: limit,
                limit: limit,
                offset: offset,
                page: page,
                search: query,
                searchJoin: 'and',
                searchFields: fields,
                with: 'user'                
            }
        });
    },
    getProcessById(id) {
        return axios.get('processes/' + id)
    },
    updateProcess(data, id) {
        return axios.put('processes/' + id, data)
    },
    createProcess(data, id) {
        return axios.post('processes', data)
    },
    delete(id) {
        return axios.delete('processes/' + id)
    }
}