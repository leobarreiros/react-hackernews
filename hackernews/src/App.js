import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React', 
    url: 'https://facebook.github.io/react/', 
    author: 'Jordan Walke', 
    num_comments: 3, 
    points: 4, 
    objectID: 0 
  }, 
  { 
    title: 'Redux', 
    url: 'https://github.com/reactjs/redux', 
    author: 'Dan Abramov, Andrew Clark', 
    num_comments: 2, 
    points: 5, 
    objectID: 1 
  }
];

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = 8;

const PATH_BASE = 'https://hn.algolia.com/api/v1'; 
const PATH_SEARCH = '/search'; 
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';


function isSearched(searchTerm) { 
  return function (item) { 
    return item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()); 
  } 
}


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {result: null, searchTerm: DEFAULT_QUERY};

    //realizar o bind de cada método com o state, para que outros componentes consigam manipular o state.
    //Sem isso, o this será undefined cada vez que um componente filho receber um destes métodos de um componente pai
    this.Dismiss = this.Dismiss.bind(this);
    this.SearchValue = this.SearchValue.bind(this);
    this.SetSearchValue = this.SetSearchValue.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
  }

  Dismiss(itemId){
    let novaLista = this.state.result.hits.filter((item) => { return item.objectID != itemId});
    this.setState({result: { ...this.state.result, hits: novaLista}}); //sintaxe para copiar lista
    //this.setState({result:{hits:novaLista}});
  }

  SearchValue(event){
    this.setState({searchTerm: event.target.value});
  }

  SetSearchValue(value){
    this.setState({searchTerm: value});
    this.onSearchSubmit();
  }

  setSearchTopStories(result) { 
    this.setState({ result }); 
  }

  onSearchSubmit(page = 0, maxPage = 1) { 
    const { searchTerm } = this.state;
    if(page >= 0 && page < maxPage){
      fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
        .then(response => response.json())
        .then(result => this.setSearchTopStories(result))
        .catch(error => error);
    }
  }

  componentDidMount() { 
    this.onSearchSubmit();
  }


  render() {
    const {searchTerm, result} = this.state;
    const page = (result && result.page) ? result.page : 0;
    const maxPage = (result && result.nbPages) ? result.nbPages : -1;

    if(!result) { return null; }

    return (
      <div className="page">
        <div className="interactions"> 
          {/* <Search onChange={this.SearchValue} /> */}
          <TextSearch onChange={this.SetSearchValue} />
          <Table list={result.hits} pattern={searchTerm} Dismiss={this.Dismiss} />
        </div>
        <div className="interactions">
          <Button onClick={ () => this.onSearchSubmit(0, maxPage)} text=" << " />
          <Button onClick={ () => this.onSearchSubmit(page - 1, maxPage)} text=" <= " />
          <Button onClick={ () => this.onSearchSubmit(page + 1, maxPage)} text=" => " />
          <Button onClick={ () => this.onSearchSubmit(maxPage -1, maxPage)} text=" >> " />
        </div>
      </div>
    );
  }
}

// Componentes que extende a classe Component conseguem manipular o state
// Se o seu componente não for manipular o state, ele pode ser criado sem herdar de Componente.
class TextSearch extends Component {
  constructor(props) {
      super();

      this.state = {
          value: props.value
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.triggerChange = this.triggerChange.bind(this);
  }

  componentWillMount() {
      this.timer = null;
  }

  handleChange(event) {
      clearTimeout(this.timer);

      this.setState({value: event.target.value});

      this.timer = setTimeout(this.triggerChange, 1000);
  }

  handleKeyDown(e) {
      if (e.keyCode === 13) {
          this.triggerChange();
      }
  }

  triggerChange() {
      const { value } = this.state;

      this.props.onChange(value);
  }

  render() {
      const { className } = this.props;

      return (
          <input type="text"
              value={this.state.value}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
          />
      );
  }
}

// Componentes que não herdam de Component não possuem acesso ao state e são considerados stateless components
// function Search({onChange, text}){
//   return (
//     <form>
//         <span>{text} </span>
//         <input type="text" onChange={onChange} />
//       </form>    
//   );
// }

const Table = ({ list, pattern, Dismiss }) =>
  <div className="table">
    {list && list.filter(isSearched(pattern)).map(item =>
      <div className="table-row" key={item.objectID}>
        <span  style={{ width: '40%' }}><a href={item.url}>{item.title}</a></span>
        <span  style={{ width: '30%' }}>{item.author}</span>
        <span  style={{ width: '10%' }}>{item.num_comments}</span>
        <span  style={{ width: '10%' }}>{item.points}</span>

        <span  style={{ width: '10%' }}>          
          <Button onClick={() => Dismiss(item.objectID)} className="button-inline" text="Dismiss" />
        </span>
      </div>
    )}
  </div>


const Button = ({ onClick, className, text }) =>
  <button onClick={onClick} className={className} type="button"> {text} </button>
  
export default App;
