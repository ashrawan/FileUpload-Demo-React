import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

ReactDOM.render(<BrowserRouter>
<Switch>
    <Route path="/" component={App}/>
</Switch>
</BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
