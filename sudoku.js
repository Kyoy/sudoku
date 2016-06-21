/*
*   A very basic and unoptimized JavaScript implementation of Sudoku.
*   @author Aurel Jared Dantis
*   @license GPLv3
*/

// Game object
var Sudoku = function(opts) {
	this.opts = opts;
	this.matrix = {
		row: [],
		col: [],
		sec: []
	};
	this.init();
	return this;
};

// Game prototype
Sudoku.prototype = {
	// Difficulty. 1 = beginner, 2 = intermediate, 3 = advanced
	opts: { 'difficulty': 1 },

	// Matrices
	matrix: {}, answers: {}, cellMatrix: [],
	
	// Prepare GUI and fill matrices with 0 values
	init: function() {
		var that = this, count = 0;
		$('h1').text('Sudoku')

		// Generate cells
		$('table').empty();
		for (var i = 1; i <= 9; i++) {
			var row = $('<tr>');
			that.cellMatrix[i-1] = [];

			for (var j = 1; j <= 9; j++) {
				var cell = $('<td>');

				$(cell).attr('i', i + '-' + j)
					   .attr('r', i - 1)
					   .attr('c', j - 1)
					   .attr('x', count)
					   .click(function(){ that.moveCursor($(this).attr('i')) });

				that.cellMatrix[i-1][j-1] = cell;

				$(row).append(cell);
				count++;
			}
			$('#grid').append(row);
		}
		$($('td')[40]).addClass('active');

		// Populate matrix with zero values
		for (var i = 0; i < 9; i++) {
			this.matrix.row[i] = [0,0,0,0,0,0,0,0,0]; 
			this.matrix.col[i] = [0,0,0,0,0,0,0,0,0];
		}
		for (var j = 0; j < 3; j++) {
			this.matrix.sec[j] = [];
			for (var k = 0; k < 3; k++)
				this.matrix.sec[j][k] = [0,0,0,0,0,0,0,0,0];
		}

		this.populateMatrix(0,0);
	},

	// Fill original matrix with random values conforming with Sudoku rules.
	// Fun fact: this same method can also be used to solve the current grid,
	// albeit with a few modifications.
	populateMatrix: function(row, col){
		var that = this, getNextCell = function(row, col) {
			// Get the nearest empty cell relative to given cell
			var r, c;
			for (var i = (col + (9 * row)); i < 81; i++) {
				r = Math.floor(i / 9);
				c = i % 9;
				if (that.matrix.row[r][c] == 0)
					return that.cellMatrix[r][c];
			}
			return false;
		}, nextCell = getNextCell(row, col);

		if (! nextCell) {
			// Board is full, now let's display the guide matrix
			that.answers = JSON.parse(JSON.stringify(that.matrix));
			that.populateGrid();
			return true;
		} else {
			// Get possible values for current cell
			var r = parseInt($(nextCell).attr('r')), c = parseInt($(nextCell).attr('c')),
				rowSec = Math.floor(r / 3), colSec = Math.floor(c / 3), index = (3 * (r % 3)) + (c % 3),
				nums = that.getLegalValues(r,c);

			// Try each value for conflicts
			for (var i = 0; i < nums.length; i++) {
				var val = nums[i];
				that.matrix.row[r][c] = val;
				that.matrix.col[c][r] = val;
				that.matrix.sec[rowSec][colSec][index] = val;

				// Recursive backtracking
				if (that.populateMatrix(r,c))
					return true; // No problem!
				else {
					// Oops, problem. Let's backtrack.
					that.matrix.row[r][c] = 0;
					that.matrix.col[c][r] = 0;
					that.matrix.sec[rowSec][colSec][index] = 0;
				}
			}

			// Oops, problem.
			return false;
		}
	},

	// Get random integer from a range
	getRandInRange: function(min, max) { return Math.floor(Math.random() * (max + 1)) + min },

	// Get possible numbers for a Sudoku cell
	getLegalValues: function(row,col) {
		var nums = [1,2,3,4,5,6,7,8,9],  // Initial possible values
			rowSec = Math.floor(row / 3), colSec = Math.floor(col / 3);

		// Walk row
		for (var i = 0; i < 9; i++) {
			var x = parseInt(this.matrix.row[row][i]);
			if (x > 0) {
				var y = nums.indexOf(x);
				if (y > -1)
					nums.splice(y, 1);
			}
		}

		// Walk column
		for (var j = 0; j < 9; j++) {
			var x = parseInt(this.matrix.col[col][j]);
			if (x > 0) {
				var y = nums.indexOf(x);
				if (y > -1)
					nums.splice(y, 1);
			}
		}

		// Walk section (3x3 grid)
		for (var k = 0; k < 9; k++) {
			var x = parseInt(this.matrix.sec[rowSec][colSec][k]);
			if (x > 0) {
				var y = nums.indexOf(x);
				if (y > -1)
					nums.splice(y, 1);
			}
		}

		// Shuffle numbers to decrease number of recurses and backtracks
		for (var z = nums.length - 1; z > 0; z--) {
			var rand = this.getRandInRange(0, z);
			var temp = nums[z];
			nums[z] = nums[rand];
			nums[rand] = temp;
		}

		return nums;
	},

	// Get currently highlighted cell
	getCurrentCell: function() { return $('.active') },

	// Display guide matrix on screen
	populateGrid: function() {
		var that = this, holes = 0;

		// Increase missing numbers based on difficulty
		switch (that.opts.difficulty) {
			case 1:
				holes = that.getRandInRange(25, 35);
				break;
			case 2:
				holes = that.getRandInRange(35, 50);
				break;
			case 3:
				holes = that.getRandInRange(50, 55);
				break;
			default:
				holes = 15;
		}

		// Randomly take out numbers
		for (var i = 0; i < holes; i++) {
			var row = Math.floor(Math.random() * 9), col = Math.floor(Math.random() * 9);
			this.answers.row[row][col] = '';
			this.answers.col[col][row] = '';
			var rowSec = Math.floor(row / 3), colSec = Math.floor(col / 3), index = (3 * (row % 3)) + (col % 3);
			this.answers.sec[rowSec][colSec][index] = '';
		}

		// Fill GUI grid
		for (var r = 0; r < 9; r++) {
			for(var c = 0; c < 9; c++) {
				var val = this.answers.row[r][c];
				if (val != "")
					$(that.cellMatrix[r][c]).addClass('guide');
				$(that.cellMatrix[r][c]).text(val);
			}
		}

		// Change theme depending on difficulty
		this.theme();
	},

	// Check if modified grid is correct
	check: function() {
		var winner = true;

		// Phase 1
		// Check if grid matches initial grid.
		// We could just use JSON.stringify on both matrices,
		// but I'm not sure if there are differences between
		// implementations on every browser.
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 9; k++)
					if (this.matrix.sec[i][j][k] != this.answers.sec[i][j][k])
						winner = false;
			}
		}

		if (!winner) {
			winner = true;

			// Phase 2
			// Check if grid is a correct solution.
			// This ambiguity can occur when user has only
			// been given a few initial numbers to work with.

			var m = this.answers, n = [];
			var replenish = function() {
				return [1,2,3,4,5,6,7,8,9];
			};

			// Walk rows
			for (var a = 0; a < 9; a++) {
				n = replenish();
				for (var b = 0; b < 9; b++) {
					var y = m.row[a][b], z = n.indexOf(y);
					if (z > -1) {
						// Number has not occurred yet
						n.splice(z, 1);
					} else {
						// Number has already occurred
						winner = false;
					}
				}
			}

			// Walk columns
			for (var a = 0; a < 9; a++) {
				n = replenish();
				for (var b = 0; b < 9; b++) {
					var y = m.col[a][b], z = n.indexOf(y);
					if (z > -1) {
						// Number has not occurred yet
						n.splice(z, 1);
					} else {
						// Number has already occurred
						winner = false;
					}
				}
			}

			// Walk sections (3x3 grids)
			for (var a = 0; a < 3; a++) {
				for (var b = 0; b < 3; b++) {
					n = replenish();

					for (var c = 0; c < 9; c++) {
						var y = m.sec[a][b][c], z = n.indexOf(y);
						if (z > -1) {
							// Number has not occurred yet
							n.splice(z, 1);
						} else {
							// Number has already occurred
							winner = false;
						}
					}
				}
			}
		}

		// Display result
		if (winner) {
			$('h1').text('Congratulations!');
			$('.grid').addClass('correct');
		} else
			this.wrong();
	},

	// Make GUI "shake", like password inputs on iOS/OS X
	wrong: function(){
		$('body').addClass('incorrect');
		var app = $('body>div');
		$(app).animate({marginLeft: '-100px'}, {
			duration: 150, queue: false,
			complete: function(){
				$(app).animate({marginLeft: 0, marginRight: '-100px'}, {
					duration: 150, queue: false,
					complete: function(){
						$(app).animate({marginLeft: '-100px', marginRight: 0}, {
							duration: 150, queue: false,
							complete: function(){
								$(app).animate({marginLeft: 0}, 150);
								setTimeout(function(){ $('body').removeClass('incorrect') }, 2000);
							}
						})
					}
				})
			}
		})
	},

	// Change game theme
	theme: function(){
		var theme = this.opts.difficulty;
		$('body').attr('class', (function(){
			if (theme == 1)
				return 'easy';
			else if (theme == 2)
				return 'medium';
			else
				return 'hard';
		})());
	},

	// Move box highlight using arrow keys
	moveCursor: function(direction) {
		var that = this,
			curr = $(that.getCurrentCell()).attr('i'),
			now = curr.split('-'),
			activate = function(newCell){
				$(that.getCurrentCell()).removeClass('active');
				$('td[i=' + newCell + ']').addClass('active');
			};

		if (typeof direction === "string") {
			activate(direction);
			return;
		}

		now = [Number(now[0]), Number(now[1])];
		switch(direction) {
			case 1:
				var left = (now[1] > 1) ? now[1] - 1 : 9;
				activate(now[0] + '-' + left);
				break;
			case 2:
				var up = (now[0] > 1) ? now[0] - 1 : 9;
				activate(up + '-' + now[1]);
				break;
			case 3:
				var right = (now[1] < 9) ? now[1] + 1 : 1;
				activate(now[0] + '-' + right);
				break;
			case 4:
				var down = (now[0] < 9) ? now[0] + 1 : 1;
				activate(down + '-' + now[1]);
				break;
			default:
				console.log('Error: invalid cursor command');
		}
	},

	// Handle number keys and silently fail on other keys
	keyup: function(key) {
		// Check if key is a number key
		var testKey = key - 48;
		if (testKey >= 0 && testKey <= 9) {
			this.modifyCell(testKey);
			return;
		} else {
			// Num Lock
			testKey = key - 96;
			if (testKey >= 0 && testKey <= 9)
				this.modifyCell(testKey);
			return;
		}
	},

	// Modify onscreen and matrix cells based on input
	modifyCell: function(value) {
		var cell = this.getCurrentCell();
		if ($(cell).hasClass('guide'))
			return;
		else {
			var r = parseInt($(cell).attr('r')), c = parseInt($(cell).attr('c')),
				rowSec = Math.floor(r / 3), colSec = Math.floor(c / 3), index = (3 * (r % 3)) + (c % 3);
			if(value == 0)
				$(cell).text('');
			else
				$(cell).text(value);
			this.answers.row[r][c] = value;
			this.answers.col[c][r] = value;
			this.answers.sec[rowSec][colSec][index] = value;
		}
	}
}

$(document).ready(function(){
	// Default difficulty is medium
	var game = new Sudoku({
		'difficulty': 2
	});

	// Handle keypresses
	$(this).on('keyup', function(e){
		var key = e.keyCode || e.which;
		e.preventDefault();
		switch (key) {
			// Arrow keys - left, up, right, down
			case 37:
				game.moveCursor(1);
				break;
			case 38:
				game.moveCursor(2);
				break;
			case 39:
				game.moveCursor(3);
				break;
			case 40:
				game.moveCursor(4);
				break;

			// Backspace
			case 8:
				game.modifyCell(0);
				break;
			// 0 keys (also backspace)
			case 48:
				game.modifyCell(0);
				break;
			case 96:
				game.modifyCell(0);
				break;
			// Delete key (also backspace)
			case 46:
				game.modifyCell(0);
				break;

			// Solve (S)
			case 83:
				game.check();
				break;
			// Beginner (Q), Intermediate (W), Advanced (E)
			case 81:
				game = new Sudoku({'difficulty': 1});
				break;
			case 87:
				game = new Sudoku({'difficulty': 2});
				break;
			case 69:
				game = new Sudoku({'difficulty': 3});
				break;

			// All other keys
			default:
				//console.log(key);
				game.keyup(key);
		}
	});

	// Game controls
	$('button').each(function(){
		$(this).click(function(){
			var verb = parseInt($(this).data('verb'));
			if (verb == 4)
				// Solve game
				game.check();
			else
				// New game with specified difficulty
				game = new Sudoku({'difficulty': verb});
		});

		// Animate button color on click
		$(this).mousedown(function(){ $(this).addClass('focused') });
		$(this).mouseup(function(){ $(this).removeClass('focused') });
	});
});
