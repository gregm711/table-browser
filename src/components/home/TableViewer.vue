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
        <vega-lite :data="distributions[i]" mark="bar"  :encoding="encodings[i]" autoResize="true"/>
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
import { Grid, Data, Formatters } from 'slickgrid-es6';
import JQuery from 'jquery'
import Trend from 'vuetrend';


export default {
  name: 'TableViewer',
  data () {
    return {
    }
  },
  components: {
    Trend,
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
        defaultColumnWidth: 200,
        rowHeight: 200,
        asyncEditorLoading: true,
        enableAsyncPostRender: true,
        };
   const dataView = new Data.DataView();
    var formattedData = [];
    for (let i = 0; i < this.rows.length; i++){
      const d = this.rows[i];
      d.id = i
      formattedData.push(d)
    }
    dataView.setItems(formattedData); // some data
    var formattedColumns = [];
    for (let i =0; i < this.columns.length; i++){
      var dict = {name: this.columns[i],  field: this.columns[i],  id: this.columns[i],  selectable: true, sortable: true, }
      formattedColumns.push(dict)
    }
     var chart = {id: "chart", name: "Chart", sortable: false, width: 600, height: 400, formatter: this.waitingFormatter, rerenderOnResize: true, asyncPostRender: this.renderSparkline}
     formattedColumns.push(chart)
      const grid = new Grid('#myGrid', dataView, formattedColumns, options);
    },

    renderSparkline(cellNode, row, dataContext, colDef) {

    var vals = [
      10,
      12,
      13,
      14,
      12,
    ]
    return (
      <div style={{ height: "100%" }}>
        asd
      </div>
    );

        // return `<trend :data="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]" :gradient="['#6fa8dc', '#42b983', '#2c3e50']"auto-draw smooth> </trend>`

    },
    waitingFormatter(){

      return (
        <div>
          asd
        </div>
      );
      // return `<trends :data="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]" :gradient="['#6fa8dc', '#42b983', '#2c3e50']"auto-draw smooth> </trends>`
    }

  },

  render: function (createElement) {
  return createElement('h1', "asd")
},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped="true">
.table-viewer{
  float: left;
  width: 80%;
  margin: 0 auto;
  .column-dists-wrapper {
    width:100%;
  //  height:400px;
   overflow:scroll;
   white-space: nowrap;
  .column-dist{
    display:inline-block;
    width:200px;
    height:300px;
    border:1px solid;
    overflow: hidden;
    line-height:80px;
    text-align:center;
    margin-bottom:4px;

  }
  }
}




</style>
