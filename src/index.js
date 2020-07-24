import React from 'react';
import ReactDOM from 'react-dom';
import TinyQueue from 'tinyqueue';
import './index.css';

import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet'
import { FaBeer, FaHeart } from 'react-icons/fa';

function Square(props) {
  var lala = props.type;
  if(lala === 0 || lala === 0) lala = ''; 
  if(lala === -1) lala = <FaBeer size = "10px" />
  if(lala === -2) lala = <FaHeart size = '10px' />
  return (
    <button style = {{backgroundColor: props.color}} className="square" onClick = {props.onClick} >
      {lala}
    </button>
  );
}

class Game extends React.Component {

  func1() {
    var temp = []; var typ = [];
    for(let i = 0; i < 6; i++) {
      var s = []; var s1 = [];
      for(let j = 0; j < 6; j++) {
        s.push('white'); s1.push(0);
      }
      temp.push(s); typ.push(s1);
    }
    return [temp, typ]
  }

  state = {
    color: this.func1()[0],
    nodeWeight: this.func1()[1],
    rows: 6,
    cols: 6,
    selected: 'Source',
    source: [-1, -1],
    end: [-1, -1],
    convex: false,
    weight: 1,
    stop: false,
  };

  onClickBFS = async() => {
    this.resetPath(); this.resetWeight(); this.resetAlien();
    if(this.state.source[0] === -1 || this.state.end[0] === -1) {
      alert('Source/End not defined!'); 
      return;
    }
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
      var temp_color = this.state.color.slice();
      for(var j=0; j<tot[i].length; j++) {
        temp_color[tot[i][j][0]][tot[i][j][1]] = 'yellow';
      }
      this.setState({
        color: temp_color,
      });
      await sleep(100);
    }
    if(!vis[this.state.end[0]][this.state.end[1]]) {
      alert('No path exists!'); return;
    }
    var fin = this.state.end; var temp_color = this.state.color;
    while(true) {
      for(var i=0;i<4;i++) {
        var x = fin[0] - x1[i]; var y = fin[1] - y1[i];
        if(x === this.state.source[0] && y === this.state.source[1]) return;
        if(x >= 0 && x < r && y >= 0 && y < c && vis[x][y] && (dp[x][y] === dp[fin[0]][fin[1]] - 1)) {
            fin = [x, y]; temp_color[x][y] = 'black'; break;
        } 
      }
      if(fin[0] === this.state.source[0] && fin[1] === this.state.source[1]) break;
      this.setState({
        color: temp_color,
      })
      await sleep(30);
    }
  }

  cmp(a, b) {
    if(a[0] > b[0]) return true;
    return false;
  }

  onClickDjikstra = async() => {
    this.resetPath(); this.resetAlien();
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    if(this.state.source[0] === -1 || this.state.end[0] === -1) {
      alert('Source/End not defined!'); 
      return;
    }

    var dp = [];
    var r = this.state.rows, c = this.state.cols;
    // document.write(r + " " + c);
    var vis = [];
    for(var i=0;i<r;i++) {
      var dp1 = []; var vis1 = [];
      for(var j=0; j<c;j++) {
        dp1.push(1000000);
        vis1.push(false);
      }
      dp.push(dp1); vis.push(vis1);
    }
    var que = []; 
    var st = this.state.source; dp[st[0]][st[1]] = 0;
    var end = this.state.end; 
    var que = [];
    que.push([0, st[0], st[1]]); var x1 = [1, -1, 0, 0]; var y1 = [0, 0, 1, -1]; vis[st[0]][st[1]] = true;
    dp[st[0]][st[1]] = 0;
    while(que.length) {
      var lind = 0; 
      for(var i=0;i<que.length;i++) {
        if(que[i][0] < que[lind][0]) lind = i;
      } 
      var top = que[lind]; que.splice(lind, 1);
      if(top[1] === end[0] && top[2] === end[1]) break;
      // document.write("top " + top[0] + " " + top[1] + " " + top[2] + " " + "<br/>");
      var temp_color = this.state.color;
      if(!(top[1] === st[0] && top[2] === st[1]) && !(top[1] === end[0] && top[2] === end[1])) {
        if(temp_color[top[1]][top[2]] === 'Aqua') temp_color[top[1]][top[2]] = 'yellow';
        else temp_color[top[1]][top[2]] = 'Aqua';
      }
      this.setState({
        color: temp_color,
      });
      await sleep(1);
      for(var i=0;i<4;i++) {
        var x = top[1] + x1[i]; var y = top[2] + y1[i];
        if(x >= 0 && x < r && y >= 0 && y < c && this.state.color[x][y] !== 'gray') {
          if((dp[x][y] > dp[top[1]][top[2]] + parseInt(this.state.nodeWeight[x][y])) || dp[x][y] === null) {
            dp[x][y] = dp[top[1]][top[2]] + parseInt(this.state.nodeWeight[x][y]);
            que.push([dp[x][y], x, y]);
          }
        } 
      }
    } 
    var last = dp[end[0]][end[1]]; var fin = end;
    if(last === 1000000) {
      alert('No path exists'); return; 
    } 
    var count = 0;
    var lala_color = this.state.color;
    for(var i=0;i<r;i++) {
      for(var j=0;j<c;j++) {
        if(dp[i][j] === 0 && !(i === this.state.source[0] && j === this.state.source[1]) && !(i === this.state.end[0] && j === this.state.end[1])) {
          lala_color[i][j] = 'DeepPink'; count++;
        } 
      }
    }
    if(count !== 0) {
      alert('Some zero path-weight nodes found, changing to pink!'); 
      this.setState({
        color: lala_color,
      });
      await sleep(1000);
    }
    var temp_color = this.state.color;
    while(true) {
      for(var i=0;i<4;i++) {
        var x = fin[0] - x1[i]; var y = fin[1] - y1[i];
        if(x === this.state.source[0] && y === this.state.source[1]) return;
        if(x >= 0 && x < r && y >= 0 && y < c && (dp[x][y] === dp[fin[0]][fin[1]] - parseInt(this.state.nodeWeight[fin[0]][fin[1]])) && temp_color[x][y] !== 'DeepPink' && temp_color[x][y] !== 'green' && temp_color[x][y] !== 'red' && temp_color[x][y] !== 'gray') {
            fin = [x, y]; 
            if(dp[x][y] !== 0) temp_color[x][y] = 'DeepPink'; 
            break;
        } 
      }
      if(fin[0] === this.state.source[0] && fin[1] === this.state.source[1]) break;
      this.setState({
        color: temp_color,
      })
      await sleep(30);
      if(dp[fin[0]][fin[1]] === 0) break;
    }
    this.setState({
      color: temp_color,
    });
    return;
  }

  cmp = (a, b) => {
    return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  }

  cw = (a, b, c) => {
    return a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]) < 0;
  }

  ccw = (a, b, c) => {
    return a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]) > 0;
  }

  onTrapAlien = async() => {
    this.resetPath();
    var ini_color = this.state.color; var ini_weight = this.state.nodeWeight;
    for(var i=0; i<this.state.rows;i++) {
      for(var j=0;j<this.state.cols;j++) {
        if(this.state.nodeWeight[i][j] < 0) {
          ini_color[i][j] = 'white';
          continue;
        } else {
          ini_color[i][j] = 'white';
          ini_weight[i][j] = 0;
        }
      }
    }
    this.setState({
      source: [-1, -1],
      end: [-1, -1],
      color: ini_color,
      nodeWeight: ini_weight,
    });
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    var arr = []; var temp_weight = this.state.nodeWeight.slice();
    for(var i=0; i<this.state.rows;i++) {
      for(var j=0;j<this.state.cols;j++) {
        if(this.state.nodeWeight[i][j] < 0) {
          // document.write("[" + i + " " + j + "] ");
          arr.push([i, j]);
          temp_weight[i][j] = -1;
        }
      }
    }

    if(arr.length === 0) {
      alert('Aliens not defined!'); 
      return;
    }

    this.setState({
      nodeWeight: temp_weight,
    });
    await sleep(500);
    arr.sort(this.cmp);
    var p1 = arr[0], p2 = arr[arr.length - 1];
    var up = [], down = [];
    up.push(p1);
    down.push(p1);
    for (var i = 1; i < arr.length; i++) {
        if (i === arr.length - 1 || this.cw(p1, arr[i], p2)) {
            while (up.length >= 2 && !this.cw(up[up.length-2], up[up.length-1], arr[i])) up.pop();
            up.push(arr[i]);
        }
        if (i === arr.length - 1 || this.ccw(p1, arr[i], p2)) {
            while(down.length >= 2 && !this.ccw(down[down.length-2], down[down.length-1], arr[i])) down.pop();
            down.push(arr[i]);
        }
    }
    arr = [];
    for (var i = 0; i < up.length; i++) arr.push(up[i]);
    for (var i = down.length - 2; i > 0; i--) arr.push(down[i]);

    for(var i=0; i<arr.length;i++) {
      temp_weight[arr[i][0]][arr[i][1]] = -2; var temp_color = this.state.color;
      temp_color[arr[i][0]][arr[i][1]] = 'DeepPink';
      this.setState({
        nodeWeight: temp_weight,
        color: temp_color,
      });
      await sleep(100);
    }
  }

  onStartAstar = async() => {
    this.resetPath(); this.resetWeight(); this.resetAlien();
    if(this.state.source[0] === -1 || this.state.end[0] === -1) {
      alert('Source/End not defined!'); 
      return;
    }
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    var r = this.state.rows; var c = this.state.cols;
    var gridF = [], gridH = [], gridG = [], gridParent = [], vis = [], close = [], open = [];
    for(var i=0; i<r;i++) {
      var gridF1 = [], gridH1 = [], gridG1 = [], gridParent1 = [], vis1 = [], close1 = [], open1 = [];
      for(var j=0;j<c;j++) {
        gridF1.push(0); gridH1.push(0);
        gridG1.push(0); gridParent1.push(null); vis1.push(false);
        close1.push(false); open1.push(false);
      }
      gridF.push(gridF1); gridH.push(gridH1);
      gridG.push(gridG1); gridParent.push(gridParent1); vis.push(vis1);
      close.push(close1); open.push(open1);
    }
    var st = this.state.source; var end = this.state.end;
    var openList = []; 
    openList.push(st); open[st[0]][st[1]] = true; var ret = []; var temp_color = this.state.color;
    while(openList.length !== 0) {
      var lind = 0;
      for(var i=0; i<openList.length; i++) {
        if(gridF[openList[i][0]][openList[i][1]] < gridF[openList[lind][0]][openList[lind][1]]) { lind = i; }
      }
      var currentNode = openList[lind];

      if(currentNode[0] === end[0] && currentNode[1] === end[1]) {
        var curr = currentNode;
        while(gridParent[curr[0]][curr[1]] !== null) {
          ret.push(curr);
          curr = gridParent[curr[0]][curr[1]];
        }
        break;
      }

      openList.splice(lind, 1);
      open[currentNode[0]][currentNode[1]] = false;
      close[currentNode[0]][currentNode[1]] = true;

      var xdif = [1, -1, 0, 0]; var ydif = [0, 0, 1, -1];
      for(var i=0;i<4;i++) {
        var x = currentNode[0] + xdif[i]; var y = currentNode[1] + ydif[i];
        if(x >= r || y >= c || x < 0 || y < 0) continue;
        if(close[x][y] === true || this.state.color[x][y] === 'gray') continue;
        var gscore = parseInt(gridG[currentNode[0]][currentNode[1]] + 1);
        var bestGscore = false;
        if(open[x][y] === false) {
          bestGscore = true;
          gridH[x][y] = parseInt(Math.abs(end[0] - x) + Math.abs(end[1] - y));
          openList.push([x, y]); open[x][y] = true;
        }
        else if(gscore < gridG[x][y]) {
          bestGscore = true;
        }

        if(bestGscore === true) {
          gridParent[x][y] = currentNode;
          gridG[x][y] = gscore;
          // document.write(gridG[x][y] + " " + gridH[x][y] + " " + gridF[x][y] + " " + x + " " + y + "<br/>");
          gridF[x][y] = parseInt(parseInt(gridG[x][y]) + parseInt(gridH[x][y]));
          // document.write(gridG[x][y] + " " + gridH[x][y] + " " + gridF[x][y] + " " + x + " " + y + "<br/>");
          if(!(x === st[0] && y === st[1]) && !(x === end[0] && y === end[1])) {
            temp_color[x][y] = 'Aqua';
            this.setState({
              color: temp_color,
            });
            await sleep(10);
          }
        }
      }
    }
    if(ret.length === 0) {
      alert('No Path Found!'); 
      return;
    } 
    for(var i=ret.length-1; i>=0;i--) {
      if(!(ret[i][0] === st[0] && ret[i][1] === st[1]) && !(ret[i][0] === end[0] && ret[i][1] === end[1])) {
        temp_color[ret[i][0]][ret[i][1]] = 'DeepPink';
      }
      this.setState({
        color: temp_color,
      });
      await sleep(10);
    }
    
  }
 
  onCellClick(i, j) {
    var temp_color = this.state.color.slice();
    if(this.state.selected === 'Source') {
      if(this.state.source[0] != -1 && this.state.convex === false && this.state.source[0] < this.state.rows && this.state.source[1] < this.state.cols) temp_color[this.state.source[0]][this.state.source[1]] = 'white';
      if(i === this.state.end[0] && j === this.state.end[1]) {
        var lulu = [-1, -1];
        this.setState({
          end: lulu,
        });
      }
      temp_color[i][j] = 'green';
      this.setState({
        color: temp_color,
        source: [i, j],
      });
    }
    else if(this.state.selected === 'Exit') {
      if(this.state.end[0] != -1 && this.state.convex === false && this.state.end[0] < this.state.rows && this.state.end[1] < this.state.cols) temp_color[this.state.end[0]][this.state.end[1]] = 'white';
      if(i === this.state.source[0] && j === this.state.source[1]) {
        var lulu = [-1, -1];
        this.setState({
          source: lulu,
        });
      }
      temp_color[i][j] = 'red';
      this.setState({
        color: temp_color,
        end: [i, j],
      });
    }
    else if(this.state.selected === 'Clear') {
      temp_color[i][j] = 'white';
      var temp_weight = this.state.nodeWeight.slice();
      temp_weight[i][j] = 0;
      this.setState({
        color: temp_color,
        nodeWeight: temp_weight,
      });
    }
    else if(this.state.selected === 'Weight') {
      var temp_weight = this.state.nodeWeight.slice();
      temp_weight[i][j] = this.state.weight;
      this.setState({
        nodeWeight: temp_weight,
      });
    }
    else if(this.state.selected === 'Alien') {
      var temp_weight = this.state.nodeWeight.slice();
      temp_weight[i][j] = -1;
      this.setState({
        nodeWeight: temp_weight,
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
            type = {this.state.nodeWeight[i][j]}
            onClick = {() => {
              this.onCellClick(i, j);
            }}
          ></Square>
        );
      }
      temp.push(
        <div className = 'singleRow'><div className = 'board-row'>{s}</div></div>
      );
    }
    return temp;
  }

  initialiseColorType = (r, c) => {
    var temp = []; var typ = [];
    for(let i = 0; i < r; i++) {
      var s = []; var s1 = [];
      for(let j = 0; j < c; j++) {
        var lulu = 'white'; var coco = 0;
        if(i < this.state.color.length && j < this.state.color[0].length) {
          lulu = this.state.color[i][j]; 
        }
        if(i < this.state.nodeWeight.length && j < this.state.nodeWeight[0].length) {
          coco = this.state.nodeWeight[i][j];
        }
        s.push(lulu); s1.push(coco);
      }
      temp.push(s); typ.push(s1);
    }
    this.setState({
      color: temp, 
      nodeWeight: typ,
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

  onWeightChange = (event) => {
    this.setState({
      applyWeight: true,
      weight: event.target.value,
    });
  }

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

  onPlaceAlien = () => {
    this.setState({
      selected: 'Alien',
    });
  }

  onWeight = () => {
    this.setState({
      selected: "Weight",
    }); 
  }

  reset = () => {
    var temp_color = this.state.color.slice();
    var temp_weight = this.state.nodeWeight.slice();
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        temp_color[i][j] = 'white';
        if(temp_weight[i][j] < 0) temp_weight[i][j] = 0;
      }
    }
    this.setState({
      color: temp_color,
      nodeWeight: temp_weight,
      source: [-1, -1],
      end: [-1, -1],
      convex: false,
    });
  }

  resetAlien = () => {
    var temp_weight = this.state.nodeWeight; var temp_color = this.state.color;
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        if(temp_weight[i][j] < 0) {
          temp_weight[i][j] = 0; temp_color[i][j] = 'white';
        }
      }
    }
    this.setState({
      nodeWeight: temp_weight,
      color: temp_color,
    });
  }

  resetPath = () => {
    var temp_color = this.state.color.slice();
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        if(temp_color[i][j] !== 'red' && temp_color[i][j] !== 'green' && temp_color[i][j] != 'gray') {
          temp_color[i][j] = 'white';
        }
      }
    }
    this.setState({
      color: temp_color,
      selected: 'Source',
    });
  } 

  resetWeight = () => {
    var temp_weight = this.state.nodeWeight; 
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        if(temp_weight[i][j] > 0) {
          temp_weight[i][j] = 0; 
        }
      }
    }
    this.setState({
      nodeWeight: temp_weight,
    });
  }

  randomWeight = () => {
    var temp_weight = this.state.nodeWeight; 
    for(var i=0; i<this.state.rows; i++) {
      for(var j=0; j<this.state.cols; j++) {
        if(temp_weight[i][j] > 0) continue;
        while(true) {
          temp_weight[i][j] = Math.floor(Math.random()*10);
          if(temp_weight[i][j] != 0) break;
        }
      }
    }
    this.setState({
      nodeWeight: temp_weight,
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
        <Helmet>
          <title>Noob Finder</title>
        </Helmet>
        <div class = 'upper'>
          <label htmlFor="vol">Rows (between 6 and 24):</label>
          &nbsp;&nbsp;
          <input 
            type="range" 
            id="rows" 
            name="vol" 
            min="6" 
            max="24" 
            class = "slider" 
            defaultValue="6" 
            onChange={(e) => {this.onRowRangeChange(e)}} 
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.state.rows}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {'||'}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <label htmlFor="vol">Columns (between 6 and 72):</label>
          &nbsp;&nbsp;
          <input type="range" id="cols" name="vol" min="6" max="72" class = 'slider' defaultValue="6" onChange={(e) => {this.onColRangeChange(e)}} />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.state.cols}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {'||'}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <label htmlFor="vol">Weight(1-9) : </label> 
          &nbsp;&nbsp;
          <input type="range" id="num" name="weight" min="1" max="9" class = 'slider' defaultValue='1' onChange={(e) => {this.onWeightChange(e)}} />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {this.state.weight}
        </div>
        {this.generateGrid()}
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.reset}>
          Reset
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.resetPath}>
          Reset Path
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.resetAlien}>
          Reset Aliens!
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.resetWeight}>
          Reset Weight!
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.randomWeight}>
          Random Weight!
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
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onWeight}>
          Place Weight
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onPlaceAlien}>
          Place Alien
        </Button>
        <Button className="margin-around-5px" variant="outlined" color="primary" onClick={this.clearCell}>
          Clear Cell
        </Button>
        <br/>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onClickBFS}>
          Start BFS
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onClickDjikstra}>
          Start Djikstra
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onTrapAlien}>
          Trap Alien
        </Button>
        <Button className="margin-around-5px" variant="contained" color="primary" onClick={this.onStartAstar}>
          Start A*
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