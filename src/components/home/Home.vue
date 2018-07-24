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


export default {
  name: 'Home',
  data () {
    return {
      rows: [],
      db: null,
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
      myWorker: null,
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

            step: function(row) {
              batchArr.push(row.data)
              if (batchArr.length == 1000) {

                that.addDataToDB(batchArr)
                batchArr = [];
                console.log("batch")
                }
          	},
        	   complete: function() {
               console.log("all done")
               that.executeQuery("SELECT * FROM tableName");


            		// console.log("All done!", results.data.length);
                // that.rows = results.data;
                // that.createDB();
            	},
              error(errors) {
                  console.log('error', errors)
              }
          })

        }
        reader.readAsText(fileToLoad)
    },

    createDistributions(){
      // SELECT " + this.columns[i] + ",  COUNT(*) FROM  tableName GROUP BY
        // var newDistributions = [];
        //
        // var newEncodings = [];
        // for (var i =0; i < this.columns.length; i++){
        //   var groupQuery = "SELECT " + this.columns[i] + ",  COUNT(*) FROM  tableName GROUP BY " + this.columns[i] + ";"
        //   var contents = this.db.exec(groupQuery);
        //   var rows = contents[0].values
        //   var newData = [];
        //   for (var j = 0; j < rows.length; j++) {
        //     var entry = {a: rows[j][0], b: rows[j][1]}
        //     newData.push(entry)
        //   }
        //     var encoding = {
        //         x: {field: 'a', type: 'ordinal'},
        //         y: {field: 'b', type: 'quantitative'}
        //       }
        //   newDistributions.push(newData)
        //   newEncodings.push(encoding)
        //
        //
        // }
        //
        //
        // this.distributions = newDistributions;
        // this.encodings = newEncodings;

    },

    addDataToDB(batchedData){


      var sqlstr = "";

      for (let i =0; i < batchedData.length; i++){
        batchedData[i].forEach((elem) => {
            sqlstr += "INSERT INTO tableName VALUES (";
            Object.keys(elem).forEach(key => {
                    sqlstr += "'" + String(elem[key]) + "'" + ", ";
            })
            sqlstr = sqlstr.slice(0, -2) + ");"
        })
      }
      this.db.run(sqlstr);

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
        var contents = this.db.exec(query);
        var newData = [];
        var columns = contents[0].columns
        var rows = contents[0].values
        var newDataArr = []

        for (var j = 0; j < rows.length; j++) {

            var newData = {};
            for (var i = 0; i < columns.length; i++) {
                newData[columns[i]] = rows[j][i];
            }
            newDataArr.push(newData)
        }
        this.rows = newDataArr;
        this.columns  = columns;

    },
  },

  mounted: function () {
    for (let i = 0; i < this.columns.length; i++){

      this.selected.push(this.columns[i])
      this.options.push({text: this.columns[i], value: this.columns[i]})
      }
    },
    created() {
    //
    //   this.myWorker = this.$worker.create([
    //   {message: 'message1', func: (arg) => `Output 1 ${arg}`},
    //   {message: 'message2', func: () => 'Output 2'}
    // ])
     this.myWorker = this.$worker.create([{message: 'addToRows', func: (data, that) => this.rows.push(data)}])


 }
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
