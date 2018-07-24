<template>
  <div id="app">
    <Home/>
  </div>
</template>

<script>
import Home from './components/home/Home.vue'
export default {
  name: 'App',
  components: {
    Home
  },
}
</script>

<style lang='scss'>
  @import './styles/_variables.scss';
  @import './styles/slickgrid.scss';
  @import '../node_modules/bootstrap/scss/bootstrap.scss';
  #app {
    input[type=checkbox]
      {
          -webkit-appearance:checkbox;
    }
    min-height: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;

  }
  .site-cont {
    margin-top: 7rem;
    @include respond-to(sm) {
      margin-top: 5.5rem;
    }
  }


  .lazy {
    @include lazy-trans;
    opacity: 0;
    &[lazy=loading] {
      opacity: 0;
    }
    &[lazy=error] {
      opacity: 1;
    }
    &[lazy=loaded] {
      opacity: 1;
    }
    &.delay-1 {
      transition-delay: $lazy-dur-1;
    }
    &.delay-2 {
      transition-delay: $lazy-dur-2;
    }
    &.delay-3 {
      transition-delay: $lazy-dur-3;
    }
  }


  .clearfix:before,
  .clearfix:after {
      content: ".";
      display: block;
      height: 0;
      overflow: hidden;
  }
  .clearfix:after { clear: both; }
  .load-mask {
    opacity: 0 !important;
    min-height: 100vh !important;
  }
  input {
    border-radius: 0px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
</style>
