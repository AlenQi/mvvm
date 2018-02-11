import MVVM from 'mvvm'

const template = `
<h2>Welcome {{user.firstname}} <span>{{user.lastname}}</span></h2>
<p>computed: {{fullname}}</p>
<input type="text" v-model="user.lastname">
<button v-on:click="sayHi">change model</button>
`;

const vm = new MVVM({
  el: '#app',
  template,
  data: {
    word: 'Hello World!',
    user: {
      firstname: '李', 
      lastname: '彦龙'
    }
  },
  computed: {
    fullname: function () {
      // getter 调用
      return this.user.firstname + ' ' + this.user.lastname;
    }
  },
  methods: {
    sayHi: function() {
      this.word = 'Hi, everybody!';
    }
  }
});
