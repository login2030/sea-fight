window.addEventListener('load', function() {
	let app =  {
		w: $(window),
		d: $(document),
		popupForm: $(document.querySelector('.js-confirm')),
		btnStart: $(document.querySelector('.js-start'))
	};

	// Форма логина
	class Form {
		constructor(form) {
			this.form = form;
			this.input = form.find('.js-confirm-input');
			this.errorClass = 'is-error';
		}
		init() {
			this.input.focus(()=> {
				this.input.removeClass(this.errorClass);
			});	
		}
		validate() {
			if (this.input.val() === '') {
				this.input.addClass(this.errorClass);
				return false;
			} else {
				this.input.removeClass(this.errorClass);
				return true;
			}
		}
		get name() {
			if (this.input.val() !== '') {
				return this.input.val();
			} else {
				console.error('Имя не введено!');
			}
		}
	}
	let form = new Form(app.popupForm); 
	form.init();

	// Игровая логика
	class Game {
		constructor() {
			this.sizeField = 9; // Размер игрового поля
			// Флотилия
			this.flotilla = [
				{
					size: 1, // Размер
					direct: 'g', // Положение в пространстве
					pos: [], // Координаты
				}, {
					size: 1,
					direct: 'g',
					pos: []
				},
				{
					size: 2,
					direct: 'g',
					pos: []
				}, {
					size: 2,
					direct: 'v',
					pos: []
				},
				{
					size: 3,
					direct: 'g',
					pos: []
				}, {
					size: 3,
					direct: 'v',
					pos: []
				},
				{
					size: 4,
					direct: 'g',
					pos: []
				}, {
					size: 4,
					direct: 'v',
					pos: []
				},
			];
			this.flotilla2 = [
				{
					size: 1,
					direct: 'g',
					pos: []
				}, {
					size: 1,
					direct: 'g',
					pos: []
				},
				{
					size: 2,
					direct: 'g',
					pos: []
				}, {
					size: 2,
					direct: 'v',
					pos: []
				},
				{
					size: 3,
					direct: 'g',
					pos: []
				}, {
					size: 3,
					direct: 'v',
					pos: []
				},
				{
					size: 4,
					direct: 'g',
					pos: []
				}, {
					size: 4,
					direct: 'v',
					pos: []
				},
			];
			this.userNameField = $(document.querySelector('.js-user-name'));
			this.battleField = $('.js-battle-field');
			this.fieldUser =  $(document.querySelector('.js-battle-field-user'));
			this.fieldComp =  $(document.querySelector('.js-battle-field-computer'));
			this.output = $(document.querySelector('.js-msg-game'));
			this.walk = true; // Можно ходить юзеру или нет
		}
		// Создание отдельного корабля
		// Сперва генерим голову корабля с учетом его длинны, потом в цикле заполняем его полностью координатами. 
		// Это только тень корабля! Если тень попадет на другой корабль, то нужно будет генерить голову еще раз.
		generateShip(ship, field) {
			let _this = this; // Можно конечно было написать стелочную функцию, но я решил почему-то вспомнить костыль сохранения контекста и почему собственно говоря этот контекст по ходу кода может измениться
			let pos = [];
			let g = 0;
			let v = 0;
			let cell = '';
			// Главное получить начальную точку так, чтобы корабль не уходил за игровое поле
			if (ship.direct === 'g') {
				// Горизонталь корабль
				v = _this.randomNum(0, _this.sizeField - ship.size + 1);
				g = _this.randomNum(0, _this.sizeField);
			} else {
				// Вертикальный корабль
				g = _this.randomNum(0, _this.sizeField - ship.size + 1);
				v = _this.randomNum(0, _this.sizeField);
			}
			// Хвост корабля
			for (let i = 0; i < ship.size; i++) {
				if (ship.direct === 'g') {
					cell = String(g) + (v + i);
				} else {
					cell = String(g + i) + v;
				}
				pos.push(cell);
			}
			return pos;
		}
		// Рисуем палубы
		drawCell(field, cell, d, type) {
			let currentCell = field.find(`.js-game-cell[data-coord=${cell}]`);
			currentCell.addClass('is-ship').html();
			if (d === 'g') {
				currentCell.addClass('is-g'); // Горизонталь
			} else {
				currentCell.addClass('is-v'); // Вертикаль
			}
			if (type === 'start') { // Начало корабля
				currentCell.addClass('is-start');
			}
			if (type === 'end') { // Конец корабля
				currentCell.addClass('is-end');
			}
			if (type === 'one') { // Корабль с одной палубой
				currentCell.addClass('is-one');
			}
		}
		// Отрисовываем корабли
		drawShip(ship, field) {
			let _this = this;
			let d = ship.direct;
			$.each(ship.pos, function(i) {
				let type;
				if (ship.pos.length === 1) {
					type = 'one';
				} else {
					if (i === 0) {
						type = 'start';
					}
					if (i === ship.pos.length - 1) {
						type = 'end';
					}
				}
				_this.drawCell(field, this, d, type);
			});
		}
		// Создаем флотилию
		// Главное проверить, чтобы корабли не накладыавлись друг на друга!
		// Иначе будет тертис блин а не морской бой!!!
		generateFlotilla(field, flotilla) {
			let _this = this;
			let pos = [];
			// Главный цикл создания флотилии
			$.each(flotilla, function(i) {
				let pos;
				// Это нужно для создания первого корабля
				do {
					pos = _this.generateShip(this, field); // Тут передается отдельный корабль
				} while (_this.crossing(pos, flotilla));
				flotilla[i].pos = pos;
			});
		}
		// Проверка на перекрытие клеток
		crossing(cells, flotilla) {
			for (let i = 0; i < flotilla.length; i++) {
				var ship = flotilla[i];
				for (let j = 0; j < cells.length; j++) {
					if (ship.pos.indexOf(cells[j]) >= 0) {
						return true;
					}
				}
			}
			return false;
		}
		// Выводим сообщения по ходу игры
		msg(text) {
			this.output.text(text);
		}
		// Устанавливаем имя пользователя
		setUserName(userName) {
			this.userNameField.text(userName);
		}
		randomEl(a) {
			return a[Math.floor(Math.random() * a.length)];
		}
		randomNum(min, max) {
			return min + Math.floor(Math.random() * (max + 1 - min));
		}
		// Генерим верстку
		generateRow(cell) {
			return `<div class="c-game__row">${cell}</div>`;
		}
		generateCell(rowNumber) {
			let cells = '';
			for (let i = 0; i < 10; i++) {
				cells += `<div class="c-game__cell js-game-cell" data-coord="${rowNumber}${i}"></div>`;
			}
			return cells;
		}
		// Ход игрока
		userTurn(cell) {
			if (!this.walk) {
				return false;
			}
			if (cell.hasClass('is-ship')) {
				cell.addClass('is-damage').removeClass('js-game-cell');
				this.msg('Ваш ход');
				this.walk = true;
			} else {
				cell.addClass('is-error').removeClass('js-game-cell');
				this.msg('Компьютер ходит');
				this.walk = false;
				setTimeout(()=> {
					this.compTurn(); // Ходит компьютер
				}, 1000);
			}
			let total = this.fieldComp.find('.is-ship').length;
			let damage = this.fieldComp.find('.is-damage').length;
			if (damage >= total) {
				this.msg('Вы выиграли! Новая игра?');
				this.output.addClass('is-success');
				this.walk = false;
				return false;
			}
		}
		// Ход компьютера
		// Комп будет очень тупым, хотя задатки для более совершенного алгоритма есть (классы!)
		compTurn() {
			let total = this.fieldUser.find('.is-ship').length;
			let damage = this.fieldUser.find('.is-damage').length;
			if (damage >= total) {
				this.msg('Вы проиграли! Новая игра?');
				this.output.addClass('is-error');
				this.walk = false;
				return false;
			}
			// Выбираем неподбитую клетку
			let cell = $(this.randomEl(
				this.fieldUser.find('.js-game-cell')
				.toArray()
			));
			if (cell.hasClass('is-ship')) {
				cell.addClass('is-damage');
				this.msg('Компьютер ходит');
				cell
					.removeClass('js-game-cell')
					.addClass('is-damage');
				// рекурсия же
				this.compTurn();
			} else {
				cell.removeClass('js-game-cell');
				this.msg('Ваш ход');
				cell.addClass('is-error');
				this.walk = true;
			}
		}
		// Главный метод
		init() {
			let _this = this;
			_this.output.removeClass('is-error is-success');
			// Генерим поле боя
			let cells = '';
			for (let i = 0; i < 10; i++) {
				cells += this.generateRow(this.generateCell(i));
			}
			_this.battleField.html(cells);
			// Генерим флотиии, поля то два, а не одно!!!
			_this.generateFlotilla(_this.fieldUser, _this.flotilla);
			_this.generateFlotilla(_this.fieldComp, _this.flotilla2);
			
			// Рисуем корабли
			$.each(_this.flotilla, function() {
				_this.drawShip(this, _this.fieldUser);
			});
			$.each(_this.flotilla2, function() {
				_this.drawShip(this, _this.fieldComp);
			});
			this.walk = true;
		}
	}
	let game = new Game();

	// Игровой процесс
	app.w.click(e=> {
		let $this = $(e.target);
		if ($this.hasClass('js-start')) {
			app.popupForm.fadeIn();
		}
		if ($this.hasClass('js-reload-game')) {
			game.init();
			game.msg('Ваш ход');
		}
		if ($this.hasClass('js-confirm-close')) {
			app.popupForm.fadeOut();
		}
	});

	app.d.submit(e=> {
		let $this = $(e.target);
		if ($this.hasClass('js-confirm')) {
			e.preventDefault();
			if (form.validate()) {
				app.popupForm.fadeOut();
				app.btnStart.removeClass('js-start').addClass('is-started  js-reload-game');
				game.init();
				game.setUserName(form.name);
				game.msg('Ваш ход');
			}
		}
	});
	// Ходы юзера
	$('.js-battle-field-computer').click(function(e) {
		let cell = $(e.target);
		if (cell.hasClass('js-game-cell')) {
			game.userTurn(cell);
		}
	});
});