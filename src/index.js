import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Button } from 'react-bootstrap';

function Square(props) {
  return (
    <button style = {{backgroundColor: props.color}} className="square" onClick = {props.onClick} >
      {props.type}
    </button>
  );
}

class Game extends React.Component {

  func() { 
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        
      }
    }
  }

  func1() {
    var temp = []; var typ = [];
    for(let i = 0; i < 6; i++) {
      var s = []; var s1 = [];
      for(let j = 0; j < 6; j++) {
        s.push('white'); s1.push('');
      }
      temp.push(s); typ.push(s1);
    }
    return [temp, typ]
  }

  state = {
    color: this.func1()[0],
    type: this.func1()[1],
    rows: 6,
    cols: 6,
    selected: 'Source',
    source: [-1, -1],
    end: [-1, -1],
    convex: false,
  };

  onClickBFS = async() => {
    var vis = []; var dp = [];
    var r = this.state.rows, c = this.state.cols;

    for(var i=0;i<r;i++) {
        vis.push(Array(c).fill(false));
        dp.push(Array(c).fill(0));
    }

    var que = []; 
    var st = this.state.source; dp[st[0]][st[1]] = 0;
    var end = this.state.end; var last = 0;

    que.push(st); var x1 = [1, -1, 0, 0]; var y1 = [0, 0, 1, -1]; var tot = []; var colChng = [];
    while(que.length !== 0) {
      var ans = false;
      var fro = que.shift(); vis[fro[0]][fro[1]] = true; 
      for(var i=0;i<4;i++) {
        var x = fro[0] + x1[i]; var y = fro[1] + y1[i];
        if(x >= 0 && x < r && y >= 0 && y < c && !vis[x][y] && this.state.color[x][y] !== 'gray') {
            vis[x][y] = true; dp[x][y] = dp[fro[0]][fro[1]] + 1; 
            if(dp[x][y] - last === 2) {
              last++;
              tot.push(colChng); colChng = [];
            }
            if(x === end[0] && y === end[1]) {
                ans = true; break;
            } else {
              que.push([x, y]); colChng.push([x, y]);
            }
        } 
      }
      if(ans) break;
    }
    if(colChng.length !== 0) tot.push(colChng);
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    for(var i=0;i<tot.length;i++) {
      await sleep(100);
      var temp_color = this.state.color.slice();
      for(var j=0; j<tot[i].length; j++) {
        temp_color[tot[i][j][0]][tot[i][j][1]] = 'yellow';
      }
      this.setState({
        color: temp_color,
      });
    }
  }

  onCellClick(i, j) {
    var temp_color = this.state.color.slice();
    if(this.state.selected === 'Source') {
      temp_color[i][j] = 'green';
      if(this.state.source[0] != -1 && this.state.convex === false) temp_color[this.state.source[0]][this.state.source[1]] = 'white';
      this.setState({
        color: temp_color,
        source: [i, j],
      });
    }
    else if(this.state.selected === 'Exit') {
      temp_color[i][j] = 'red';
      if(this.state.end[0] != -1 && this.state.convex === false) temp_color[this.state.end[0]][this.state.end[1]] = 'white';
      this.setState({
        color: temp_color,
        end: [i, j],
      });
    }
    else if(this.state.selected === 'Clear') {
      temp_color[i][j] = 'white';
      this.setState({
        color: temp_color,
      });
    }
    else {
      temp_color[i][j] = 'gray';
      this.setState({
        color: temp_color,
      });
    }
  }

  generateGrid() {
    var temp = []; 
    for(let i = 0; i < this.state.color.length; i++) {
      var s = [];
      for(let j = 0; j < this.state.color[0].length; j++) {
        s.push(
          <Square 
            color = {this.state.color[i][j]}
            type = {this.state.type[i][j]}
            onClick = {() => {
              this.onCellClick(i, j);
            }}
          ></Square>
        );
      }
      temp.push(
        <div className = 'row_render'><div className = 'board-row'>{s}</div></div>
      );
    }
    return temp;
  }

  initialiseColorType = (r, c) => {
    var temp = []; var typ = [];
    for(let i = 0; i < r; i++) {
      var s = []; var s1 = [];
      for(let j = 0; j < c; j++) {
        s.push('white'); s1.push('');
      }
      temp.push(s); typ.push(s1);
    }
    this.setState({
      color: temp, 
      type: typ,
    });
  }

  onRowRangeChange = (event) => {
    this.setState({
      rows: event.target.value,
    });
    this.initialiseColorType(event.target.value, this.state.cols);
  };

  onColRangeChange = (event) => {
    this.setState({
      cols: event.target.value,
    });
    this.initialiseColorType(this.state.rows, event.target.value);
  };

  placeEntry = () => {
    this.setState({
      selected: 'Source',
    });
  }

  placeExit = () => {
    this.setState({
      selected: 'Exit',
    });
  }

  placeWall = () => {
    this.setState({
      selected: 'Wall',
    });
  }

  reset = () => {
    var temp_color = this.state.color.slice();
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        temp_color[i][j] = 'white';
      }
    }
    this.setState({
      color: temp_color,
      source: [-1, -1],
      end: [-1, -1],
      convex: false,
    });
  }

  clearCell = () => {
    this.setState ({
      selected: 'Clear',
    });
  }

  render() {
    return (
      <div className='pura'>
        <label htmlFor="vol">Rows (between 6 and 34):</label>
        <input type="range" id="rows" name="vol" min="6" max="34" defaultValue="6" onChange={(e) => {this.onRowRangeChange(e)}} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.state.rows}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {'||'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.state.cols}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        <label htmlFor="vol">Columns (between 6 and 76):</label>
        <input type="range" id="cols" name="vol" min="6" max="76" defaultValue="6" onChange={(e) => {this.onColRangeChange(e)}} />
        <br /><br/>
        <div className='table'>
        {this.generateGrid()}
        </div>
        <br />
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onClickBFS}>
          Start BFS
        </Button>
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.reset}>
          Reset
        </Button>
        <br /> 
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.placeEntry}>
          Place Source
        </Button>
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.placeExit}>
          Place End
        </Button>
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.placeWall}>
          Place Wall
        </Button>
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.clearCell}>
          Clear Cell
        </Button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);