<template>
    <div class="home">
        <h1>Upload EXWRK csv</h1>
        <div style="margin-top: 3rem;">
        <input id="fileInput" class="input" type="file" @change="upload" style="padding: 2rem; margin: 0 auto;">
      </div>
        <div class="wrapper" v-if="this.rows.length > 0">
        <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Enter SQL Query" aria-label="SQL Query" v-model="query" aria-describedby="basic-addon2">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" @click="executeQuery(query)">Enter Query</button>
            </div>
        </div>
        <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Enter slope" aria-label="SQL Query" @change="executeQuery" aria-describedby="basic-addon2">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button">Enter the correct slope</button>
            </div>
        </div>
        <div class="column-selector-container">
          <h4>Shown Columns</h4>
            <b-form-group >
                <b-form-checkbox-group stacked style="text-align: left;" v-model="selected" name="columns-selected" :options="options">
                </b-form-checkbox-group>
            </b-form-group>
        </div>
        <div class="column-selector-container">
          <h4>Group by</h4>
            <b-form-group >
                <b-form-checkbox-group stacked style="text-align: left;" v-model="grouped" name="columns-selected" :options="options">
                </b-form-checkbox-group>
            </b-form-group>
        </div>
        </div>
        <table-viewer :rows="rows" :columns="columns" :distributions="distributions" :encodings="encodings"></table-viewer>
    </div>
</template>
<script>
import TableViewer from './TableViewer'
import Papa from 'papaparse'
import sql from 'sql.js'
import sizeof from 'object-sizeof';
import alasql from 'alasql'


export default {
  name: 'Home',
  data () {
    return {
      rows: [],
      query: "",
      selected: [], // Must be an array reference!
      columns : ['WKR_ID',	'L1_KEY',	'DSG_CHG_ID',	'L1_DSG_CHG_PRT_NO',	'L1_BASIC_PRT_NO',
      'L1_DSG_CHG_NO',	'SUPLR_NO',	'BUYER_DESK_ID',	'BUYER_USER_ID',
      'BUYER_STG_ID',	'SUPLR_STG_ID',	'PRT_TPE',	'RFQ_NO',	'BASE_CURR',
      'DUE_DT',	'Q_CAL_FINAL_TOT_CS',	'QUOTE_NO',	'CURRNT_OWNER',
      'CURRENT_DESK_ID',	'CURRENT_USER_ID',	'WRK_STATUS',	'Q_BUYER_STATUS',
      'Q_SUPLR_STATUS',	'IS_TOOL_ATTCHD',	'VERSION',	'CREATED_USER_ID',
      'CREATED_DT_TS',	'UPDATED_USER_ID',	'UPDATED_DT_TS',	'WKR_LIST_COMMENT'],
      distributions: [],
      encodings: [],
      options: [],
      grouped: [],
    }
  },

  watch: {
      selected: function (val) {

        var query = "SELECT ";
        if (this.selected.length != this.columns.length) {
        this.selected.forEach((elem) =>{
          query += elem + ", ";
        })
        query = query.slice(0, -2);
        query += " FROM tableName";
        query = query.replace(/,\s*$/, "");
        this.executeQuery(query)
      }
      },
      grouped: function (val) {

        var query = "SELECT ";
        if (this.selected.length != this.columns.length) {
        this.selected.forEach((elem) =>{
          query += elem + ", ";
        })
        query = query.slice(0, -2);
        query += " FROM tableName";
        query = query.replace(/,\s*$/, "");
        this.executeQuery(query)
      }
      },
      rows: function (val) {
        this.createDistributions();
      }
    },
  components: {
    TableViewer
  },
  methods:{
    upload(e) {
        const that = this
        const fileToLoad = event.target.files[0]
        const reader = new FileReader()
        reader.onload = fileLoadedEvent => {
          var batchArr = []
          that.createDB();
          Papa.parse(fileLoadedEvent.target.result, {
            header: true,
            fastMode: true,
            dynamicTyping: true,

            // step: function(row) {
            //   batchArr.push(row.data)
            //   if (batchArr.length == 1000) {
            //
            //     that.addDataToDB(batchArr)
            //     batchArr = [];
            //     console.log("batch")
            //     }
          	// },
        	   complete: function(results) {
               console.log("all done")
                that.rows = results.data;
                that.createAlasqDB()
            	},
              error(errors) {
                  console.log('error', errors)
              }
          })

        }
        reader.readAsText(fileToLoad)
    },

    createAlasqDB(){

      var sqlstr = "CREATE TABLE tableName (";
      for (let i = 0; i < this.columns.length; i++) {

          const type = "varchar"

          if (i == this.columns.length - 1) {
              sqlstr += this.columns[i] + " " + type;
          } else {
              sqlstr += this.columns[i] + " " + type + ", ";
          }
      }
      sqlstr += ")";
      alasql(sqlstr);
      alasql.tables.tableName.data = this.rows
    },

    createDistributions(){

        var newDistributions = [];

        var newEncodings = [];
        for (var i =0; i < this.columns.length; i++){
          let groupQuery = "SELECT " + this.columns[i] + ",  COUNT(*) FROM  tableName GROUP BY " + this.columns[i] + ";"
          let res = alasql(groupQuery);
          var newData = [];
          for (var j = 0; j < res.length; j++) {
            let row   = res[j]
            let keys  = Object.keys(row)
            let entry = {a: row[keys[0]], b: row[keys[1]]}

            newData.push(entry)
          }
        let encoding = {
            x: {field: 'a', type: 'ordinal'},
            y: {field: 'b', type: 'quantitative'}
          }

          newDistributions.push(newData)
          newEncodings.push(encoding)
        }

        this.distributions = newDistributions;
        this.encodings = newEncodings;

    },
    createDB() {
        this.db = new sql.Database();
        var sqlstr = "CREATE TABLE tableName (";
        for (let i = 0; i < this.columns.length; i++) {
            const type = "varchar"

            if (i == this.columns.length - 1) {
                sqlstr += this.columns[i] + " " + type;
            } else {
                sqlstr += this.columns[i] + " " + type + ", ";
            }
        }
        sqlstr += ");";
        this.db.run(sqlstr);

    },

    executeQuery(query) {
      var res = alasql(query);
      this.rows = res
      this.columns = Object.keys(res[0])
    },
  },

  mounted: function () {
    for (let i = 0; i < this.columns.length; i++){

      this.selected.push(this.columns[i])
      this.options.push({text: this.columns[i], value: this.columns[i]})
      }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.home{
  margin: 0 auto;
   text-align: center;
   padding: 2rem;
   .column-selector-container{
     border: solid  1px grey;
     float: right;
   }
}




</style>
