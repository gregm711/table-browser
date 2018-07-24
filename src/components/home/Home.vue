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
        <!-- <div class="column-selector-container">
          <h4>Shown Columns</h4>
            <b-form-group >
                <b-form-checkbox-group stacked style="text-align: left;" v-model="selected" name="columns-selected" :options="options">
                </b-form-checkbox-group>
            </b-form-group>
        </div> -->
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
import alasql from 'alasql'
import moment from 'moment'


export default {
    name: 'Home',
    data() {
        return {
            rows: [],
            tableName: "tab",
            query: "",
            selected: [], // Must be an array reference!
            columns: [],
            distributions: [],
            encodings: [],
            options: [],
            grouped: [],
            db: false,
            dbInsert: null,
        }
    },

    watch: {
        selected: function(val) {
            let difference = this.columns.filter(x => !this.selected.includes(x));
            console.log(difference)
            for (let i = 0; i < difference.length; i++) {
                var res = alasql('SELECT * REMOVE COLUMN ' + difference[i] + ' FROM ' + this.tableName)

                this.rows = res

            }
        },
        grouped: function(val) {

            var query = "SELECT ";
            if (this.selected.length != this.columns.length) {
                this.selected.forEach((elem) => {
                    query += elem + ", ";
                })
                query = query.slice(0, -2);
                query += " FROM " + this.tableName;
                query = query.replace(/,\s*$/, "");
                this.executeQuery(query)
            }
        },
        rows: function(val) {

            this.columns = Object.keys(this.rows[0])
            this.createdSelected()
            this.createDistributions();
        }
    },
    components: {
        TableViewer
    },
    methods: {
        upload(e) {
            const that = this
            const fileToLoad = event.target.files[0]
            const reader = new FileReader()
            reader.onload = fileLoadedEvent => {

                Papa.parse(fileLoadedEvent.target.result, {
                    header: true,
                    fastMode: true,
                    dynamicTyping: true,
                    step: function(row) {
                        if (!that.db) {
                            that.createAlasqDB(row.data[0])
                        }
                        that.dbInsert(row.data[0])
                    },
                    complete: function() {
                        var res = alasql("SELECT * FROM " + that.tableName)
                        that.rows = res;
                    },
                    error(errors) {
                        console.log('error', errors)
                    }
                })

            }
            reader.readAsText(fileToLoad)
        },
        createAlasqDB(row) {
            var insertFunction = 'INSERT INTO  ' + this.tableName + '  ('
            var sqlstr = "CREATE TABLE " + this.tableName + " (";

            var formats = [
                moment.ISO_8601,
                "MM/DD/YYYY  :)  HH*mm*ss",
                "MM/DD/YY "
            ];
            for (var key in row) {
              if (typeof row[key] == "string") {
              let tmp = moment(row[key])
              if (tmp.isValid()){
                  sqlstr += key + "  Date, "
                  insertFunction += ":" + key + ","
                }
                else{
                  sqlstr += key + " " + typeof row[key] + ", "
                  insertFunction += ":" + key + ","
                }
              }else{;
                sqlstr += key + " " + typeof row[key] + ", "
                insertFunction += ":" + key + ","
              }
            }
            sqlstr = sqlstr.slice(0, -2);
            insertFunction = insertFunction.slice(0, -1);
            insertFunction += ")";
            sqlstr += ")";
            alasql(sqlstr);
            let indexStr = "CREATE INDEX " + Object.keys(row)[0]  + " ON " + this.tableName + "(" + Object.keys(row)[0] + ")";
            alasql(indexStr)
            this.db = true;
            this.dbInsert = alasql.compile(insertFunction)
        },


        createDistributions() {

            var newDistributions = [];

            var newEncodings = [];
            for (let i = 0; i < this.columns.length; i++) {
                let groupQuery = "SELECT " + this.columns[i] + ",  COUNT(*) FROM " + this.tableName + "  GROUP BY " + this.columns[i] + ";"
                let res = alasql(groupQuery);
                var newData = [];
                for (let j = 0; j < res.length; j++) {
                    let row = res[j]
                    let keys = Object.keys(row)
                    let entry = {
                        values: row[keys[0]],
                        count: row[keys[1]]
                    }

                    newData.push(entry)
                }
                let encoding = {
                    x: {
                        field: 'values',
                        type: 'ordinal'
                    },
                    y: {
                        field: 'count',
                        type: 'quantitative'
                    }
                }

                newDistributions.push(newData)
                newEncodings.push(encoding)
            }

            this.distributions = newDistributions;
            this.encodings = newEncodings;

        },
        createdSelected() {
            for (let i = 0; i < this.columns.length; i++) {
                this.selected.push(this.columns[i])
                this.options.push({
                    text: this.columns[i],
                    value: this.columns[i]
                })
            }
        },
        executeQuery(query) {
            var res = alasql(query);
            this.rows = res


        },

    },
    mounted: function () {
      console.log("asd")





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
