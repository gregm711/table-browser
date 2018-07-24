<template>
  <div class="table-viewer">
    <div class="container">


  <div class="columns">
    <div class="menu-container column">
      <div class="menu"></div>
    </div>
    <div class="demo column is-two-thirds">
      <div class="column-dists-wrapper">
        <div v-for="(value, i) in distributions" class="column-dist">
        <vega-lite :data="distributions[i]" mark="bar"  :encoding="encodings[i]"/>
      </div>
      </div>
      <div id="myGrid" style="height:600px;" class="slickgrid-container"></div>
    </div>
    <div class="controls column"></div>
  </div>
</div>
  </div>
</template>

<script>
import Papa from 'papaparse'
import sql from 'sql.js'
import { Grid, Data, Formatters } from 'slickgrid-es6';

export default {
  name: 'TableViewer',
  data () {
    return {
    }
  },
  props: {
  rows: Array,
  columns: Array,
  distributions: Array,
  encodings: Array,
},
watch: {
    rows: function (val) {
      console.log("new values")
      this.createSlickGridTable();
    },
    distributions: function (val) {
      console.log("new distributions")

    }
  },

  methods:{
    createSlickGridTable(){
      const options = {
        forceFitColumns: false,
        fullWidthRows: true,
        showHeaderRow: true,
        defaultColumnWidth: 100,
        asyncEditorLoading: true,
        enableAsyncPostRender: true,
        };

   //
   const dataView = new Data.DataView();
    var formattedData = [];
    for (let i = 0; i < this.rows.length; i++){

      const d = this.rows[i];
      d.id = i
      formattedData.push(d)
    }
    dataView.setItems(formattedData); // some data


    var columns = this.columns;
    var formattedColumns = [];
    for (let i =0; i < columns.length; i++){
      var dict = {name: columns[i],  field: columns[i],  id: columns[i],  selectable: true, sortable: true, }
      formattedColumns.push(dict)
    }
        const grid = new Grid('#myGrid', dataView, formattedColumns, options);
    },

  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped="true">
.table-viewer{
  float: left;
  width: 70%;
  margin: 0 auto;
  .column-dists-wrapper {
    width:100%;
   height:400px;
   overflow:scroll;
   white-space: nowrap;
  .column-dist{
    display:inline-block;
    width:100px;
    height:200px;
    border:1px solid;
    line-height:80px;
    text-align:center;
    margin-bottom:4px;

  }
  }
}




</style>
