module.exports = function($p) {
/**
 * Дополнительные методы перечисления Типы соединений
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 23.12.2015
 *
 * @module enm_cnn_types
 */

(function(_mgr){

	const acn = {
    ii: [_mgr.Наложение],
    i: [_mgr.НезамкнутыйКонтур],
    a: [
      _mgr.УгловоеДиагональное,
      _mgr.УгловоеКВертикальной,
      _mgr.УгловоеКГоризонтальной,
      _mgr.КрестВСтык],
    t: [_mgr.ТОбразное, _mgr.КрестВСтык],
	};


	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type Object
	 */
	Object.defineProperties(_mgr, {
	  ad: {
	    get: function () {
        return this.УгловоеДиагональное;
      }
    },
    av: {
      get: function () {
        return this.УгловоеКВертикальной;
      }
    },
    ah: {
      get: function () {
        return this.УгловоеКГоризонтальной;
      }
    },
    t: {
      get: function () {
        return this.ТОбразное;
      }
    },
    ii: {
      get: function () {
        return this.Наложение;
      }
    },
    i: {
      get: function () {
        return this.НезамкнутыйКонтур;
      }
    },
    xt: {
      get: function () {
        return this.КрестПересечение;
      }
    },
    xx: {
      get: function () {
        return this.КрестВСтык;
      }
    },

    /**
     * Массивы Типов соединений
     * @type Object
     */
    acn: {
      value: acn
    },

  });

})($p.enm.cnn_types);

/**
 * Дополнительные методы перечисления Типы элементов
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module enm_elm_types
 */

(function(_mgr){

	const cache = {};

  /**
   * Массивы Типов элементов
   * @type Object
   */
	_mgr.__define({

		profiles: {
			get : function(){
				return cache.profiles
					|| ( cache.profiles = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп] );
			}
		},

		profile_items: {
			get : function(){
				return cache.profile_items
					|| ( cache.profile_items = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп,
						_mgr.Добор,
						_mgr.Соединитель,
						_mgr.Раскладка
					] );
			}
		},

		rama_impost: {
			get : function(){
				return cache.rama_impost
					|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
			}
		},

		impost_lay: {
			get : function(){
				return cache.impost_lay
					|| ( cache.impost_lay = [ _mgr.Импост, _mgr.Раскладка] );
			}
		},

		stvs: {
			get : function(){
				return cache.stvs || ( cache.stvs = [_mgr.Створка] );
			}
		},

		glasses: {
			get : function(){
				return cache.glasses
					|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
			}
		}

	});


})($p.enm.elm_types);

/**
 * ### Модификаторы перечислений
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module enmums
 *
 * Created 22.04.2016
 */

(function($p){

	/**
	 * Дополнительные методы перечисления Типы открывания
	 */
	$p.enm.open_types.__define({

		is_opening: {
			value: function (v) {

				if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное)
					return false;

				return true;

			}
		}

		/*
		 ,

		 rotary: {
		 get: function () {
		 return this.Поворотное;
		 }
		 },

		 folding: {
		 get: function () {
		 return this.Откидное;
		 }
		 },

		 rotary_folding: {
		 get: function () {
		 return this.ПоворотноОткидное;
		 }
		 },

		 deaf: {
		 get: function () {
		 return this.Глухое;
		 }
		 },

		 sliding: {
		 get: function () {
		 return this.Раздвижное;
		 }
		 },

		 fixed: {
		 get: function () {
		 return this.Неподвижное;
		 }
		 }
		 */

	});

	/**
	 * Дополнительные методы перечисления Ориентация
	 */
	$p.enm.orientations.__define({

		hor: {
			get: function () {
				return this.Горизонтальная;
			}
		},

		vert: {
			get: function () {
				return this.Вертикальная;
			}
		},

		incline: {
			get: function () {
				return this.Наклонная;
			}
		}
	});

	/**
	 * Дополнительные методы перечисления ПоложениеЭлемента
	 */
	$p.enm.positions.__define({

		left: {
			get: function () {
				return this.Лев;
			}
		},

		right: {
			get: function () {
				return this.Прав;
			}
		},

		top: {
			get: function () {
				return this.Верх;
			}
		},

		bottom: {
			get: function () {
				return this.Низ;
			}
		},

		hor: {
			get: function () {
				return this.ЦентрГоризонталь;
			}
		},

		vert: {
			get: function () {
				return this.ЦентрВертикаль;
			}
		}
	});


})($p);

/**
 * ### Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_characteristics
 *
 * Created 16.03.2016
 */

// при старте приложения, загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
$p.md.once('predefined_elmnts_inited', () => {
  const _mgr = $p.cat.characteristics;
  _mgr.adapter.load_view(_mgr, 'doc/nom_characteristics')
    // и корректируем метаданные формы спецификации с учетом ролей пользователя
    .then(() => {
    const {current_user} = $p;
      if(current_user && (
          current_user.role_available('СогласованиеРасчетовЗаказов') ||
          current_user.role_available('ИзменениеТехнологическойНСИ') ||
          current_user.role_available('РедактированиеЦен')
        )) {
        return;
      };
      _mgr.metadata().form.obj.tabular_sections.specification.widths = "50,*,70,*,50,70,70,80,70,70,70,0,0,0";
    })
});

// свойства объекта характеристики
$p.CatCharacteristics = class CatCharacteristics extends $p.CatCharacteristics {

  // перед записью надо пересчитать наименование и рассчитать итоги
  before_save(attr) {

    // уточняем номенклатуру системы
    const {prod_nom, calc_order, _data} = this;

    // контроль прав на запись характеристики
    if(calc_order.is_read_only) {
      _data._err = {
        title: 'Права доступа',
        type: 'alert-error',
        text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
      };
      return false;
    }

    // пересчитываем наименование
    const name = this.prod_name();
    if(name) {
      this.name = name;
    }

    // дублируем контрагента для целей RLS
    this.partner = calc_order.partner;

  }

  /**
   * Добавляет параметры вставки
   * @param inset
   * @param cnstr
   */
  add_inset_params(inset, cnstr, blank_inset) {
    const ts_params = this.params;
    const params = [];

    ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, (row) => {
      params.indexOf(row.param) === -1 && params.push(row.param);
      return row.param;
    });

    inset.used_params.forEach((param) => {
      if(params.indexOf(param) == -1) {
        ts_params.add({
          cnstr: cnstr,
          inset: blank_inset || inset,
          param: param
        });
        params.push(param);
      }
    });
  }

  /**
   * Рассчитывает наименование продукции
   */
  prod_name(short) {
    const {calc_order_row, calc_order, leading_product, sys, clr} = this;
    let name = '';

    if(calc_order_row) {

      if(calc_order.number_internal) {
        name = calc_order.number_internal.trim();
      }
      else {
        // убираем нули из середины номера
        let num0 = calc_order.number_doc, part = '';
        for (let i = 0; i < num0.length; i++) {
          if(isNaN(parseInt(num0[i]))) {
            name += num0[i];
          }
          else {
            break;
          }
        }
        for (let i = num0.length - 1; i > 0; i--) {
          if(isNaN(parseInt(num0[i]))) {
            break;
          }
          part = num0[i] + part;
        }
        name += parseInt(part || 0).toFixed(0);
      }

      name += '/' + calc_order_row.row.pad();

      // для подчиненных, номер строки родителя
      if(!leading_product.empty()) {
        name += ':' + leading_product.calc_order_row.row.pad();
      }

      // добавляем название системы
      if(!sys.empty()) {
        name += '/' + sys.name;
      }

      if(!short) {

        // добавляем название цвета
        if(!clr.empty()) {
          name += '/' + this.clr.name;
        }

        // добавляем размеры
        if(this.x && this.y) {
          name += '/' + this.x.toFixed(0) + 'x' + this.y.toFixed(0);
        }
        else if(this.x) {
          name += '/' + this.x.toFixed(0);
        }
        else if(this.y) {
          name += '/' + this.y.toFixed(0);
        }

        if(this.z) {
          if(this.x || this.y) {
            name += 'x' + this.z.toFixed(0);
          }
          else {
            name += '/' + this.z.toFixed(0);
          }
        }

        if(this.s) {
          name += '/S:' + this.s.toFixed(3);
        }

        // подмешиваем значения параметров
        let sprm = '';
        this.params.find_rows({cnstr: 0}, (row) => {
          if(row.param.include_to_name && sprm.indexOf(String(row.value)) == -1) {
            sprm && (sprm += ';');
            sprm += String(row.value);
          }
        });
        if(sprm) {
          name += '|' + sprm;
        }
      }
    }
    return name;
  }

  /**
   * Открывает форму происхождения строки спецификации
   */
  open_origin(row_id) {
    try {
      let {origin} = this.specification.get(row_id);
      if(typeof origin == 'number') {
        origin = this.cnn_elmnts.get(origin - 1).cnn;
      }
      if(origin.is_new()) {
        return $p.msg.show_msg({
          type: 'alert-warning',
          text: `Пустая ссылка на настройки в строке №${row_id + 1}`,
          title: o.presentation
        });
      }
      origin.form_obj();
    }
    catch (err) {
      $p.record_log(err);
    }
  }

  /**
   * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
   * @param elm {Number} - номер элемента или контура
   * @param origin {CatInserts} - порождающая вставка
   * @return {CatCharacteristics}
   */
  find_create_cx(elm, origin) {
    const {_manager, calc_order, params, inserts} = this;
    let cx;
    _manager.find_rows({leading_product: this, leading_elm: elm, origin}, (obj) => {
      if(!obj._deleted) {
        cx = obj;
        return false;
      }
    });
    if(!cx) {
      cx = $p.cat.characteristics.create({
        calc_order: calc_order,
        leading_product: this,
        leading_elm: elm,
        origin: origin
      }, false, true)._set_loaded();
    }

    // переносим в cx параметры
    const {length, width} = $p.job_prm.properties;
    cx.params.clear();
    params.find_rows({cnstr: -elm, inset: origin}, (row) => {
      if(row.param != length && row.param != width) {
        cx.params.add({param: row.param, value: row.value});
      }
    });
    // переносим в cx цвет
    inserts.find_rows({cnstr: -elm, inset: origin}, (row) => {
      cx.clr = row.clr;
    });
    cx.name = cx.prod_name();
    return cx;
  }

  /**
   * Возврвщает строку заказа, которой принадлежит продукция
   */
  get calc_order_row() {
    let _calc_order_row;
    this.calc_order.production.find_rows({characteristic: this}, (_row) => {
      _calc_order_row = _row;
      return false;
    });
    return _calc_order_row;
  }

  /**
   * Возвращает номенклатуру продукции по системе
   */
  get prod_nom() {
    if(!this.sys.empty()) {

      var setted,
        param = this.params;

      if(this.sys.production.count() == 1) {
        this.owner = this.sys.production.get(0).nom;

      }
      else if(this.sys.production.count() > 1) {
        this.sys.production.each((row) => {

          if(setted) {
            return false;
          }

          if(row.param && !row.param.empty()) {
            param.find_rows({cnstr: 0, param: row.param, value: row.value}, () => {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }

        });
        if(!setted) {
          this.sys.production.find_rows({param: $p.utils.blank.guid}, (row) => {
            setted = true;
            param._owner.owner = row.nom;
            return false;
          });
        }
        if(!setted) {
          this.owner = this.sys.production.get(0).nom;
        }
      }
    }

    return this.owner;
  }
};

// при изменении реквизита табчасти вставок
$p.CatCharacteristicsInsertsRow.prototype.value_change = function (field, type, value) {
  // для вложенных вставок перезаполняем параметры
  if(field == 'inset') {
    if(value != this.inset){
      const {_owner} = this._owner;
      // удаляем параметры старой вставки
      !this.inset.empty() && _owner.params.clear({inset: this.inset, cnstr: this.cnstr});
      // устанавливаем значение новой вставки
      this._obj.inset = value;
      // заполняем параметры по умолчанию
      _owner.add_inset_params(this.inset, this.cnstr);
    }
  }
}




// индивидуальная форма объекта характеристики
$p.cat.characteristics.form_obj = function (pwnd, attr) {

  const _meta = this.metadata();

  attr.draw_tabular_sections = function (o, wnd, tabular_init) {

    _meta.form.obj.tabular_sections_order.forEach((ts) => {
      if(ts == 'specification') {
        // табчасть со специфическим набором кнопок
        tabular_init('specification', $p.injected_data['toolbar_characteristics_specification.xml']);
        wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent('onclick', (btn_id) => {

          if(btn_id == 'btn_origin') {
            const selId = wnd.elmnts.grids.specification.getSelectedRowId();
            if(selId && !isNaN(Number(selId))) {
              return o.open_origin(Number(selId) - 1);
            }

            $p.msg.show_msg({
              type: 'alert-warning',
              text: $p.msg.no_selected_row.replace('%1', 'Спецификация'),
              title: o.presentation
            });
          }

        });
      }
      else {
        tabular_init(ts);
      }
    });
  };

  return this.constructor.prototype.form_obj.call(this, pwnd, attr)
    .then(function (res) {
      if(res) {
        o = res.o;
        wnd = res.wnd;
        return res;
      }
    });
};

/**
 * ### Форма выбора типового блока
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_characteristics_form_selection_block
 *
 * Created 23.12.2015
 */

(function($p){

	const _mgr = $p.cat.characteristics;
	let selection_block, wnd;

	class SelectionBlock {

	  constructor(_mgr) {

	    this._obj = {
        calc_order: $p.wsql.get_user_param("template_block_calc_order")
      }

      this._meta = Object.assign(_mgr.metadata()._clone(), {
        form: {
          selection: {
            fields: ["presentation","svg"],
            cols: [
              {"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
              {"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
            ]
          }
        }
      });
    }

    // виртуальные метаданные для поля фильтра по заказу
    _metadata(f) {
	    const {calc_order} = this._meta.fields;
      return f ? calc_order : {fields: {calc_order}};
    }

    get _manager() {
	    return {
        value_mgr: $p.md.value_mgr,
        class_name: "dp.fake"
      }
    }

    get calc_order() {
      return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
    }
    set calc_order(v) {

	    const {_obj, attr} = this;

      if(!v || v == _obj.calc_order){
        return;
      }
      // если вместо заказа прибежала харакетристика - возвращаем её в качестве результата
      if(v._block){
        wnd && wnd.close();
        return attr.on_select && attr.on_select(v._block);
      }
      _obj.calc_order = v.valueOf();

      if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount()){
        wnd.elmnts.filter.call_event();
      }

      if(!$p.utils.is_empty_guid(_obj.calc_order) &&
        $p.wsql.get_user_param("template_block_calc_order") != _obj.calc_order){
        $p.wsql.set_user_param("template_block_calc_order", _obj.calc_order);
      }
    }

  }

	// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
	_mgr.form_selection_block = function(pwnd, attr = {}){

		if(!selection_block){
			selection_block = new SelectionBlock(_mgr);
		}
    selection_block.attr = attr;

		// объект отбора по ссылке на расчет в продукции
		if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			$p.job_prm.builder.base_block.some((o) => {
				selection_block.calc_order = o;
				return true;
			});
		}

		// начальное значение - выбранные в предыдущий раз типовой блок
		attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

		// подсовываем типовой форме списка изменённые метаданные
		attr.metadata = selection_block._meta;

		// и еще, подсовываем форме собственный обработчик получения данных
		attr.custom_selection = function (attr) {
			const ares = [], crefs = [];
			let calc_order;

			// получаем ссылку на расчет из отбора
			attr.selection.some((o) => {
				if(Object.keys(o).indexOf("calc_order") != -1){
					calc_order = o.calc_order;
					return true;
				}
			});

			// получаем документ расчет
			return $p.doc.calc_order.get(calc_order, true, true)
				.then((o) => {

					// получаем массив ссылок на характеристики в табчасти продукции
					o.production.each((row) => {
						if(!row.characteristic.empty()){
							if(row.characteristic.is_new()){
                crefs.push(row.characteristic.ref);
              }
							else{
								// если это характеристика продукции - добавляем
								if(!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()){
									if(row.characteristic._attachments &&
										row.characteristic._attachments.svg &&
										!row.characteristic._attachments.svg.stub){
                    ares.push(row.characteristic);
                  }
									else{
                    crefs.push(row.characteristic.ref);
                  }
								}
							}
						}
					});
					return crefs.length ? _mgr.adapter.load_array(_mgr, crefs, true) : crefs;
				})
				.then(() => {

					// если это характеристика продукции - добавляем
					crefs.forEach((o) => {
						o = _mgr.get(o, false, true);
						if(o && !o.calc_order.empty() && o.coordinates.count()){
							ares.push(o);
						}
					});

					// фильтруем по подстроке
					crefs.length = 0;
					ares.forEach((o) => {
            const presentation = ((o.calc_order_row && o.calc_order_row.note) || o.note || o.name) + "<br />" + o.owner.name;
						if(!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase()))
							crefs.push({
								ref: o.ref,
                presentation:   '<div style="white-space:normal"> ' + presentation + ' </div>',
								svg: o._attachments ? o._attachments.svg : ""
							});
					});

					// догружаем изображения
					ares.length = 0;
					crefs.forEach((o) => {
						if(o.svg && o.svg.data){
							ares.push($p.utils.blob_as_text(o.svg.data)
								.then(function (svg) {
									o.svg = svg;
								}))
						}
					});
					return Promise.all(ares);

				})
        // конвертируем в xml для вставки в грид
				.then(() => $p.iface.data_to_grid.call(_mgr, crefs, attr));

		};

		// создаём форму списка
		wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

		wnd.elmnts.toolbar.hideItem("btn_new");
		wnd.elmnts.toolbar.hideItem("btn_edit");
		wnd.elmnts.toolbar.hideItem("btn_delete");

		// добавляем элемент управления фильтра по расчету
		wnd.elmnts.filter.add_filter({
			text: "Расчет",
			name: "calc_order"
		});
    const fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
		fdiv.removeChild(fdiv.firstChild);

		wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
			parent: fdiv,
			obj: selection_block,
			field: "calc_order",
			width: 220,
			get_option_list: (selection, val) => new Promise((resolve, reject) => {

			  setTimeout(() => {
          const l = [];
          const {base_block, branch_filter} = $p.job_prm.builder;

          base_block.forEach(({note, presentation, ref, production}) => {
            if(branch_filter && branch_filter.sys && branch_filter.sys.length && production.count()) {
              const {characteristic} = production.get(0);
              if(!branch_filter.sys.some((filter) => characteristic.sys._hierarchy(filter))){
                return;
              }
            }
            if(selection.presentation && selection.presentation.like){
              if(note.toLowerCase().match(selection.presentation.like.toLowerCase()) ||
                presentation.toLowerCase().match(selection.presentation.like.toLowerCase())){
                l.push({text: note || presentation, value: ref});
              }
            }else{
              l.push({text: note || presentation, value: ref});
            }
          });

          l.sort((a, b) => {
            if (a.text < b.text){
              return -1;
            }
            else if (a.text > b.text){
              return 1;
            }
            else{
              return 0;
            }
          });

          resolve(l);

        }, $p.job_prm.builder.base_block ? 0 : 1000);
			})
		});
		wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};

})($p);

/**
 * ### Дополнительные методы справочника Цвета
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_cnns
 *
 * Created 23.12.2015
 */

$p.cat.clrs.__define({

	/**
	 * ПолучитьЦветПоПредопределенномуЦвету
	 * @param clr {CatClrs} - цвет исходной строки соединения, фурнитуры или вставки
	 * @param clr_elm {CatClrs} - цвет элемента
	 * @param clr_sch {CatClrs} - цвет изделия
	 * @return {*}
	 */
  by_predefined: {
    value: function (clr, clr_elm, clr_sch, elm, spec) {

      const {predefined_name} = clr;
      if(predefined_name) {
        switch (predefined_name) {
        case 'КакЭлемент':
          return clr_elm;
        case 'КакИзделие':
          return clr_sch;
        case 'КакЭлементСнаружи':
          return clr_elm.clr_out.empty() ? clr_elm : clr_elm.clr_out;
        case 'КакЭлементИзнутри':
          return clr_elm.clr_in.empty() ? clr_elm : clr_elm.clr_in;
        case 'КакИзделиеСнаружи':
          return clr_sch.clr_out.empty() ? clr_sch : clr_sch.clr_out;
        case 'КакИзделиеИзнутри':
          return clr_sch.clr_in.empty() ? clr_sch : clr_sch.clr_in;
        case 'КакЭлементИнверсный':
          return this.inverted(clr_elm);
        case 'КакИзделиеИнверсный':
          return this.inverted(clr_sch);
        case 'БезЦвета':
          return this.get();
        case 'КакВедущий':
        case 'КакВедущийИзнутри':
        case 'КакВедущийСнаружи':
        case 'КакВедущийИнверсный':
          const sub_clr = this.predefined(predefined_name.replace('КакВедущий', 'КакЭлемент'));
          const t_parent = elm && elm.t_parent();
          if(!elm || elm === t_parent){
            return this.by_predefined(sub_clr,  clr_elm);
          }
          let finded = false;
          spec && spec.find_rows({elm: t_parent.elm, nom: t_parent.nom}, (row) => {
            finded = this.by_predefined(sub_clr,  row.clr);
            return false;
          });
          return finded || clr_elm;

        default :
          return clr_elm;
        }
      }
      return clr.empty() ? clr_elm : clr;
    }
  },

  /**
   * ### Инверсный цвет
   * Возвращает элемент, цвета которого изнутри и снаружи перевёрнуты местами
   * @param clr {CatClrs} - исходный цвет
   */
  inverted: {
    value: function(clr){
      if(clr.clr_in == clr.clr_out || clr.clr_in.empty() || clr.clr_out.empty()){
        return clr;
      }
      // ищем в справочнике цветов
      const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
        [this.alatable, clr.clr_out.ref, clr.clr_in.ref, $p.utils.blank.guid]);
      return ares.length ? this.get(ares[0]) : clr
    }
  },

	/**
	 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
	 * @param mf {Object} - описание метаданных поля
	 */
	selection_exclude_service: {
		value: function (mf, sys) {

			if(mf.choice_params)
				mf.choice_params.length = 0;
			else
				mf.choice_params = [];

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});

			if(sys){
				mf.choice_params.push({
					name: "ref",
					get path(){
            const res = [];
						let clr_group, elm;

						function add_by_clr(clr) {
              if(clr instanceof $p.CatClrs){
                const {ref} = clr;
                if(clr.is_folder){
                  $p.cat.clrs.alatable.forEach((row) => row.parent == ref && res.push(row.ref))
                }
                else{
                  res.push(ref)
                }
              }
              else if(clr instanceof $p.CatColor_price_groups){
                clr.clr_conformity.forEach(({clr1}) => add_by_clr(clr1))
              }
            }

						if(sys instanceof $p.Editor.BuilderElement){
							clr_group = sys.inset.clr_group;
							if(clr_group.empty() && !(sys instanceof $p.Editor.Filling)){
                clr_group = sys.project._dp.sys.clr_group;
              }
						}
						else if(sys instanceof $p.classes.DataProcessorObj){
							clr_group = sys.sys.clr_group;
						}
						else{
							clr_group = sys.clr_group;
						}

						if(clr_group.empty() || !clr_group.clr_conformity.count()){
              return {not: ''};
						}
						else{
              add_by_clr(clr_group)
						}
						return {in: res};
					}
				});
			}
		}
	},

	/**
	 * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
	 */
	form_selection: {
		value: function (pwnd, attr) {

		  const eclr = this.get();

			attr.hide_filter = true;

      attr.toolbar_click = function (btn_id, wnd){

        // если указаны оба цвета
        if(btn_id=="btn_select" && !eclr.clr_in.empty() && !eclr.clr_out.empty()) {

          // ищем в справочнике цветов
          const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
            [$p.cat.clrs.alatable, eclr.clr_in.ref, eclr.clr_out.ref, $p.utils.blank.guid]);

          // если не нашли - создаём
          if(ares.length){
            pwnd.on_select.call(pwnd, $p.cat.clrs.get(ares[0]));
          }
          else{
            $p.cat.clrs.create({
              clr_in: eclr.clr_in,
              clr_out: eclr.clr_out,
              name: eclr.clr_in.name + " \\ " + eclr.clr_out.name,
              parent: $p.job_prm.builder.composite_clr_folder
            })
            // регистрируем цвет в couchdb
              .then((obj) => obj.register_on_server())
              .then((obj) => pwnd.on_select.call(pwnd, obj))
              .catch((err) => $p.msg.show_msg({
                type: "alert-warning",
                text: "Недостаточно прав для добавления составного цвета",
                title: "Составной цвет"
              }));
          }

          wnd.close();
          return false;
        }
      }

      const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

			function get_option_list(selection, val) {

				selection.clr_in = $p.utils.blank.guid;
				selection.clr_out = $p.utils.blank.guid;

				if(attr.selection){
					attr.selection.some((sel) => {
						for(var key in sel){
							if(key == "ref"){
								selection.ref = sel.ref;
								return true;
							}
						}
					});
				}

				return this.constructor.prototype.get_option_list.call(this, selection, val);
			}

			return (wnd instanceof Promise ? wnd : Promise.resolve(wnd))
				.then((wnd) => {

					const tb_filter = wnd.elmnts.filter;

					tb_filter.__define({
						get_filter: {
							value: () => {
								const res = {
									selection: []
								};
								if(clr_in.getSelectedValue())
									res.selection.push({clr_in: clr_in.getSelectedValue()});
								if(clr_out.getSelectedValue())
									res.selection.push({clr_out: clr_out.getSelectedValue()});
								if(res.selection.length)
									res.hide_tree = true;
								return res;
							}
						}
					});

					wnd.attachEvent("onClose", () => {

						clr_in.unload();
						clr_out.unload();

						eclr.clr_in = $p.utils.blank.guid;
						eclr.clr_out = $p.utils.blank.guid;

						return true;
					});


					eclr.clr_in = $p.utils.blank.guid;
					eclr.clr_out = $p.utils.blank.guid;

					// Создаём элементы управления
					const clr_in = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_in",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});
					const clr_out = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_out",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});

					clr_in.DOMelem.style.float = "left";
					clr_in.DOMelem_input.placeholder = "Цвет изнутри";
					clr_out.DOMelem_input.placeholder = "Цвет снаружи";

					clr_in.attachEvent("onChange", tb_filter.call_event);
					clr_out.attachEvent("onChange", tb_filter.call_event);
					clr_in.attachEvent("onClose", tb_filter.call_event);
					clr_out.attachEvent("onClose", tb_filter.call_event);

					// гасим кнопки управления
          wnd.elmnts.toolbar.hideItem("btn_new");
          wnd.elmnts.toolbar.hideItem("btn_edit");
          wnd.elmnts.toolbar.hideItem("btn_delete");

          wnd.elmnts.toolbar.setItemText("btn_select", "<b>Выбрать или создать</b>");

					return wnd;

				})
		}
	},

	/**
	 * Изменяем алгоритм построения формы списка. Игнорируем иерархию, если указаны цвета изнутри или снаружи
	 */
	sync_grid: {
		value: function(attr, grid) {

			if(attr.action == "get_selection" && attr.selection && attr.selection.some(function (v) {
				return v.hasOwnProperty("clr_in") || v.hasOwnProperty("clr_out");
				})){
				delete attr.parent;
				delete attr.initial_value;
			}

			return $p.classes.DataManager.prototype.sync_grid.call(this, attr, grid);
		}
	}
});

$p.CatClrs = class CatClrs extends $p.CatClrs {

  // записывает элемент цвета на сервере
  register_on_server() {
    return $p.wsql.pouch.save_obj(this, {
      db: $p.wsql.pouch.remote.ram
    })
      .then(function (obj) {
        return obj.save();
      })
  }

  // возвращает стороны, на которых цвет
  get sides() {
    const res = {is_in: false, is_out: false};
    if(!this.empty() && !this.predefined_name){
      if(this.clr_in.empty() && this.clr_out.empty()){
        res.is_in = res.is_out = true;
      }
      else{
        if(!this.clr_in.empty() && !this.clr_in.predefined_name){
          res.is_in = true;
        }
        if(!this.clr_out.empty() && !this.clr_out.predefined_name){
          res.is_out = true;
        }
      }
    }
    return res;
  }
};



/**
 * ### Дополнительные методы справочника _Соединения_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 * @module cat_cnns
 * Created 23.12.2015
 */

$p.cat.cnns.__define({

  _nomcache: {
    value: {}
  },

  sql_selection_list_flds: {
    value: function(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
        " left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
    }
  },

  /**
   * Возвращает массив соединений, доступный для сочетания номенклатур.
   * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
   * @param nom1 {_cat.nom|BuilderElement}
   * @param [nom2] {_cat.nom|BuilderElement}
   * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
   * @param [ign_side] {Boolean}
   * @param [is_outer] {Boolean}
   * @return {Array}
   */
  nom_cnn: {
    value: function(nom1, nom2, cnn_types, ign_side, is_outer){

      const {ProfileItem, BuilderElement, Filling} = $p.Editor;
      const {Вертикальная} = $p.enm.orientations

      // если второй элемент вертикальный - меняем местами эл 1-2 при поиске
      if(nom1 instanceof ProfileItem && nom2 instanceof ProfileItem &&
        cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
        nom1.orientation != Вертикальная && nom2.orientation == Вертикальная ){
        return this.nom_cnn(nom2, nom1, cnn_types);
      }

      // если оба элемента - профили, определяем сторону
      const side = is_outer ? $p.enm.cnn_sides.Снаружи :
        (!ign_side && nom1 instanceof ProfileItem && nom2 instanceof ProfileItem && nom2.cnn_side(nom1));

      let onom2, a1, a2, thickness1, thickness2, is_i = false, art1glass = false, art2glass = false;

      if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
        is_i = true;
        onom2 = nom2 = $p.cat.nom.get();
      }
      else{
        if(nom2 instanceof BuilderElement){
          onom2 = nom2.nom;
        }
        else if($p.utils.is_data_obj(nom2)){
          onom2 = nom2;
        }
        else{
          onom2 = $p.cat.nom.get(nom2);
        }
      }

      const ref1 = nom1.ref;
      const ref2 = onom2.ref;

      if(!is_i){
        if(nom1 instanceof Filling){
          art1glass = true;
          thickness1 = nom1.thickness;
        }
        else if(nom2 instanceof Filling){
          art2glass = true;
          thickness2 = nom2.thickness;
        }
      }

      if(!this._nomcache[ref1]){
        this._nomcache[ref1] = {};
      }
      a1 = this._nomcache[ref1];
      if(!a1[ref2]){
        a2 = (a1[ref2] = []);
        // для всех элементов справочника соединения
        this.each((cnn) => {
          // если в строках соединяемых элементов есть наша - добавляем
          let is_nom1 = art1glass ? (cnn.art1glass && thickness1 >= cnn.tmin && thickness1 <= cnn.tmax && cnn.cnn_type == $p.enm.cnn_types.Наложение) : false,
            is_nom2 = art2glass ? (cnn.art2glass && thickness2 >= cnn.tmin && thickness2 <= cnn.tmax) : false;

          cnn.cnn_elmnts.each((row) => {
            if(is_nom1 && is_nom2){
              return false;
            }
            is_nom1 = is_nom1 || (row.nom1 == ref1 && (row.nom2.empty() || row.nom2 == onom2));
            is_nom2 = is_nom2 || (row.nom2 == onom2 && (row.nom1.empty() || row.nom1 == ref1));
          });
          if(is_nom1 && is_nom2){
            a2.push(cnn);
          }
        });
      }

      if(cnn_types){
        const types = Array.isArray(cnn_types) ? cnn_types : (
            $p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1 ? $p.enm.cnn_types.acn.a : [cnn_types]
          );
        return a1[ref2].filter((cnn) => {
          if(types.indexOf(cnn.cnn_type) != -1){
            if(!side){
              return true
            }
            if(cnn.sd1 == $p.enm.cnn_sides.Изнутри){
              return side == $p.enm.cnn_sides.Изнутри;
            }
            else if(cnn.sd1 == $p.enm.cnn_sides.Снаружи){
              return side == $p.enm.cnn_sides.Снаружи;
            }
            else{
              return true;
            }
          }
        });
      }

      return a1[ref2];
    }
  },

  /**
   * Возвращает соединение между элементами
   * @param elm1
   * @param elm2
   * @param [cnn_types] {Array}
   * @param [curr_cnn] {_cat.cnns}
   * @param [ign_side] {Boolean}
   * @param [is_outer] {Boolean}
   */
  elm_cnn: {
    value: function(elm1, elm2, cnn_types, curr_cnn, ign_side, is_outer){

      // если установленное ранее соединение проходит по типу и стороне, нового не ищем
      if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type) != -1) && (cnn_types != $p.enm.cnn_types.acn.ii)){

        // TODO: проверить геометрию

        if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Изнутри){
          if(typeof is_outer == 'boolean'){
            if(!is_outer){
              return curr_cnn;
            }
          }
          else{
            if(elm2.cnn_side(elm1) == $p.enm.cnn_sides.Изнутри){
              return curr_cnn;
            }
          }
        }
        else if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Снаружи){
          if(is_outer || elm2.cnn_side(elm1) == $p.enm.cnn_sides.Снаружи)
            return curr_cnn;
        }
        else{
          return curr_cnn;
        }
      }

      const cnns = this.nom_cnn(elm1, elm2, cnn_types, ign_side, is_outer);

      // сортируем по непустой стороне и приоритету
      if(cnns.length){
        const sides = [$p.enm.cnn_sides.Изнутри, $p.enm.cnn_sides.Снаружи];
        if(cnns.length > 1){
          cnns.sort((a, b) => {
            if(sides.indexOf(a.sd1) != -1 && sides.indexOf(b.sd1) == -1){
              return 1;
            }
            if(sides.indexOf(b.sd1) != -1 && sides.indexOf(a.sd1) == -1){
              return -1;
            }
            if (a.priority > b.priority) {
              return -1;
            }
            if (a.priority < b.priority) {
              return 1;
            }
            if (a.name > b.name) {
              return -1;
            }
            if (a.name < b.name) {
              return 1;
            }
            return 0;
          });
        }
        return cnns[0];
      }
      // TODO: возможно, надо вернуть соединение с пустотой
      else{

      }
    }
  },

})

// публичные методы объекта
$p.CatCnns.prototype.__define({

	/**
	 * Возвращает основную строку спецификации соединения между элементами
	 */
	main_row: {
		value: function (elm) {

			var ares, nom = elm.nom;

			// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
			if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

				var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

				ares = this.specification.find_rows({nom: art12});
				if(ares.length)
					return ares[0]._row;
			}

			// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
			if(this.cnn_elmnts.find_rows({nom1: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
				if(ares.length)
					return ares[0]._row;
			}
			if(this.cnn_elmnts.find_rows({nom2: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
				if(ares.length)
					return ares[0]._row;
			}
			ares = this.specification.find_rows({nom: nom});
			if(ares.length)
				return ares[0]._row;

		}
	},

	/**
	 * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
	 */
	check_nom2: {
		value: function (nom) {
			var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
			return this.cnn_elmnts._obj.some(function (row) {
				return row.nom == ref;
			})
		}
	}

});

/**
 * ### Дополнительные методы справочника _Договоры контрагентов_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_contracts
 *
 * Created 23.12.2015
 */

$p.cat.contracts.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization, _p_.name as partner," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" +
				" left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" +
				" left outer join cat_partners as _p_ on _p_.ref = _t_.owner" +
				" left outer join enm_mutual_contract_settlements as _m_ on _m_.ref = _t_.mutual_settlements" +
				" left outer join enm_contract_kinds as _k_ on _k_.ref = _t_.contract_kind %3 %4 LIMIT 300";
		}
	},

	by_partner_and_org: {
		value: function (partner, organization, contract_kind) {
			if(!contract_kind)
				contract_kind = $p.enm.contract_kinds.СПокупателем;
			var res = this.find_rows({owner: partner, organization: organization, contract_kind: contract_kind});
			res.sort(function (a, b) {
				return a.date > b.date;
			});
			return res.length ? res[0] : this.get();
		}
	}


});

// перед записью, устанавливаем код, родителя и наименование
// _mgr.on("before_save", function (attr) {
//
//
//
// });

/**
 * @module cat_divisions
 *
 * Created by Evgeniy Malyarov on 27.05.2017.
 */


Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value: function (selection, val) {
      const list = [];
      $p.current_user.acl_objs.find_rows({type: "cat.divisions"}, ({acl_obj}) => {
        if(list.indexOf(acl_obj) == -1){
          list.push(acl_obj);
          acl_obj._children().forEach((o) => list.indexOf(o) == -1 && list.push(o));
        }
      });
      if(!list.length){
        return this.constructor.prototype.get_option_list.call(this, selection, val);
      }

      function check(v){
        if($p.utils.is_equal(v.value, val))
          v.selected = true;
        return v;
      }

      const l = [];
      $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

      l.sort(function(a, b) {
        if (a.text < b.text){
          return -1;
        }
        else if (a.text > b.text){
          return 1;
        }
        return 0;
      })
      return Promise.resolve(l);
    }
  }
});

/**
 * ### Дополнительные методы справочника Визуализация элементов
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 08.04.2016
 *
 * @module cat_elm_visualization
 */

// публичные методы объекта
$p.CatElm_visualization.prototype.__define({

	draw: {
		value: function (elm, layer, offset) {

		  const {CompoundPath, constructor} = elm.project._scope;

			let subpath;

			if(this.svg_path.indexOf('{"method":') == 0){

				const attr = JSON.parse(this.svg_path);

				if(attr.method == "subpath_outer"){

					subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

					subpath.parent = layer._by_spec;
					subpath.strokeWidth = attr.strokeWidth || 4;
					subpath.strokeColor = attr.strokeColor || 'red';
					subpath.strokeCap = attr.strokeCap || 'round';
					if(attr.dashArray)
						subpath.dashArray = attr.dashArray

				}

			}
			else if(this.svg_path){

				subpath = new CompoundPath({
					pathData: this.svg_path,
					parent: layer._by_spec,
					strokeColor: 'black',
					fillColor: 'white',
					strokeScaling: false,
					pivot: [0, 0],
					opacity: elm.opacity
				});

				if(elm instanceof constructor.Filling) {
          subpath.position = elm.bounds.topLeft.add([20,10]);
        }
        else {

          // угол касательной
          var angle_hor;
          if(elm.is_linear() || offset < 0)
            angle_hor = elm.generatrix.getTangentAt(0).angle;
          else if(offset > elm.generatrix.length)
            angle_hor = elm.generatrix.getTangentAt(elm.generatrix.length).angle;
          else
            angle_hor = elm.generatrix.getTangentAt(offset).angle;

          if((this.rotate != -1 || elm.orientation == $p.enm.orientations.Горизонтальная) && angle_hor != this.angle_hor){
            subpath.rotation = angle_hor - this.angle_hor;
          }

          offset += elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

          const p0 = elm.generatrix.getPointAt(offset > elm.generatrix.length ? elm.generatrix.length : offset || 0);

          if(this.elm_side == -1){
            // в середине элемента
            const p1 = elm.rays.inner.getNearestPoint(p0);
            const p2 = elm.rays.outer.getNearestPoint(p0);

            subpath.position = p1.add(p2).divide(2);

          }else if(!this.elm_side){
            // изнутри
            subpath.position = elm.rays.inner.getNearestPoint(p0);

          }else{
            // снаружи
            subpath.position = elm.rays.outer.getNearestPoint(p0);
          }
        }

			}
		}
	}

});

/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

// обработчик события после загрузки данных в озу
$p.adapters.pouch.once('pouch_data_loaded', () => {
  // читаем элементы из pouchdb и создаём формулы
  const {formulas} = $p.cat;
  formulas.adapter.find_rows(formulas, {_top: 500, _skip: 0})
    .then((rows) => {
      const parents = [formulas.predefined('printing_plates'), formulas.predefined('modifiers')];
      const filtered = rows.filter(v => !v.disabled && parents.indexOf(v.parent) !== -1);
      filtered.sort((a, b) => a.sorting_field - b.sorting_field).forEach((formula) => {
        // формируем списки печатных форм и внешних обработок
        if(formula.parent == parents[0]) {
          formula.params.find_rows({param: 'destination'}, (dest) => {
            const dmgr = $p.md.mgr_by_class_name(dest.value);
            if(dmgr) {
              if(!dmgr._printing_plates) {
                dmgr._printing_plates = {};
              }
              dmgr._printing_plates[`prn_${formula.ref}`] = formula;
            }
          });
        }
        else {
          // выполняем модификаторы
          try {
            formula.execute();
          }
          catch (err) {
          }
        }
      });
    });
});


$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj, attr) {

			// создаём функцию из текста формулы
			if(!this._data._formula && this.formula){
			  try{
          if(this.async){
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            this._data._formula = (new AsyncFunction("obj,$p,attr", this.formula)).bind(this);
          }
          else{
            this._data._formula = (new Function("obj,$p,attr", this.formula)).bind(this);
          }
        }
        catch(err){
          this._data._formula = () => false;
          $p.record_log(err);
        }
      }

      const {_formula} = this._data;

			if(this.parent == $p.cat.formulas.predefined("printing_plates")){

        if(!_formula){
          $p.msg.show_msg({
            title: $p.msg.bld_title,
            type: "alert-error",
            text: `Ошибка в формуле<br /><b>${this.name}</b>`
          });
          return Promise.resolve();
        }

				// получаем HTMLDivElement с отчетом
				return _formula(obj, $p, attr)

				  // показываем отчет в отдельном окне
					.then((doc) => doc instanceof $p.SpreadsheetDocument && doc.print());

			}
			else{
        return _formula && _formula(obj, $p, attr)
      }

		}
	},

	_template: {
		get: function () {
			if(!this._data._template){
        this._data._template = new $p.SpreadsheetDocument(this.template);
      }
			return this._data._template;
		}
	}
});

/**
 * Дополнительные методы справочника Фурнитура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author Evgeniy Malyarov
 * @module cat_furns
 */

/**
 * Методы менеджера фурнитуры
 */
Object.defineProperties($p.cat.furns, {

  sql_selection_list_flds: {
    value: function(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
    }
  },

  get_option_list: {
    value: function (selection, val) {

      const {characteristic, sys} = paper.project._dp;
      const {furn} = $p.job_prm.properties;

      if(furn && sys && !sys.empty()){

        const links = furn.params_links({
          grid: {selection: {cnstr: 0}},
          obj: {_owner: {_owner: characteristic}}
        });

        if(links.length){
          // собираем все доступные значения в одном массиве
          const list = [];
          links.forEach((link) => link.values.forEach((row) => list.push(this.get(row._obj.value))));

          function check(v){
            if($p.utils.is_equal(v.value, val))
              v.selected = true;
            return v;
          }

          const l = [];
          $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

          l.sort((a, b) => {
            if (a.text < b.text){
              return -1;
            }
            else if (a.text > b.text){
              return 1;
            }
            return 0;
          });
          return Promise.resolve(l);
        }
      }
      return this.constructor.prototype.get_option_list.call(this, selection, val);
    },
    configurable: true
  }

});

/**
 * Методы объекта фурнитуры
 */
$p.CatFurns = class CatFurns extends $p.CatFurns {

  /**
   * Перезаполняет табчасть параметров указанного контура
   */
  refill_prm({project, furn, cnstr}) {

    const fprms = project.ox.params;
    const {direction} = $p.job_prm.properties;

    // формируем массив требуемых параметров по задействованным в contour.furn.furn_set
    const aprm = furn.furn_set.add_furn_prm();
    aprm.sort((a, b) => {
      if (a.presentation > b.presentation) {
        return 1;
      }
      if (a.presentation < b.presentation) {
        return -1;
      }
      return 0;
    });

    // дозаполняем и приклеиваем значения по умолчанию
    aprm.forEach((v) => {

      // направления в табчасть не добавляем
      if(v == direction){
        return;
      }

      let prm_row, forcibly = true;
      fprms.find_rows({param: v, cnstr: cnstr}, (row) => {
        prm_row = row;
        return forcibly = false;
      });
      if(!prm_row){
        prm_row = fprms.add({param: v, cnstr: cnstr}, true);
      }

      // умолчания и скрытость по табчасти системы
      const {param} = prm_row;
      project._dp.sys.furn_params.each((row) => {
        if(row.param == param){
          if(row.forcibly || forcibly){
            prm_row.value = row.value;
          }
          prm_row.hide = row.hide || param.is_calculated;
          return false;
        }
      });

      // умолчания по связям параметров
      param.linked_values(param.params_links({
        grid: {selection: {cnstr: cnstr}},
        obj: {_owner: {_owner: project.ox}}
      }), prm_row);

    });

    // удаляем лишние строки
    const adel = [];
    fprms.find_rows({cnstr: cnstr}, (row) => {
      if(aprm.indexOf(row.param) == -1)
        adel.push(row);
    });
    adel.forEach((row) => fprms.del(row, true));

  }

  /**
   * Вытягивает массив используемых фурнитурой и вложенными наборами параметров
   */
  add_furn_prm(aprm = [], afurn_set = []) {

    // если параметры этого набора уже обработаны - пропускаем
    if(afurn_set.indexOf(this.ref)!=-1){
      return;
    }

    afurn_set.push(this.ref);

    this.selection_params.each((row) => {aprm.indexOf(row.param)==-1 && !row.param.is_calculated && aprm.push(row.param)});

    this.specification.each((row) => {row.nom instanceof $p.CatFurns && row.nom.add_furn_prm(aprm, afurn_set)});

    return aprm;

  }

  /**
   * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
   * @param contour {Contour}
   * @param cache {Object}
   * @param [exclude_dop] {Boolean}
   */
  get_spec(contour, cache, exclude_dop) {

    const res = $p.dp.buyers_order.create().specification;
    const {ox} = contour.project;
    const {НаПримыкающий} = $p.enm.transfer_operations_options;

    // бежим по всем строкам набора
    this.specification.find_rows({dop: 0}, (row_furn) => {

      // проверяем, проходит ли строка
      if(!row_furn.check_restrictions(contour, cache)){
        return;
      }

      // ищем строки дополнительной спецификации
      if(!exclude_dop){
        this.specification.find_rows({is_main_specification_row: false, elm: row_furn.elm}, (dop_row) => {

          if(!dop_row.check_restrictions(contour, cache)){
            return;
          }

          // расчет координаты и (или) визуализации
          if(dop_row.is_procedure_row){

            // для правого открывания, инвертируем координату
            const invert = contour.direction == $p.enm.open_directions.Правое;
            // получаем элемент через сторону фурнитуры
            const elm = contour.profile_by_furn_side(dop_row.side, cache);
            // profile._len - то, что получится после обработки
            // row_spec.len - сколько взять (отрезать)
            // len - геометрическая длина без учета припусков на обработку
            const {len} = elm._row;
            // свойство номенклатуры размер до фурнпаза
            const {sizefurn} = elm.nom;
            // в зависимости от значения константы add_d, вычисляем dx1
            const dx1 = $p.job_prm.builder.add_d ? sizefurn : 0;
            // длина с поправкой на фурнпаз
            const faltz = len - 2 * sizefurn;

            let invert_nearest = false, coordin = 0;

            if(dop_row.offset_option == $p.enm.offset_options.Формула){
              if(!dop_row.formula.empty()){
                coordin = dop_row.formula.execute({ox, elm, contour, len, sizefurn, dx1, faltz, invert, dop_row});
              }
            }
            else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
              coordin = faltz + dop_row.contraction;
            }
            else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
              // строим горизонтальную линию от нижней границы контура, находим пересечение и offset
              const {generatrix} = elm;
              const hor = contour.handle_line(elm);
              coordin = generatrix.getOffsetOf(generatrix.intersect_point(hor)) -
                generatrix.getOffsetOf(generatrix.getNearestPoint(elm.corns(1))) +
                (invert ? dop_row.contraction : -dop_row.contraction);
            }
            else if(dop_row.offset_option == $p.enm.offset_options.ОтСередины){
              // не мудрствуя, присваиваем половину длины
              coordin = len / 2 + (invert ? dop_row.contraction : -dop_row.contraction);
            }
            else{
              if(invert){
                if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                  coordin = dop_row.contraction;
                }
                else{
                  coordin = len - dop_row.contraction;
                }
              }
              else{
                if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                  coordin = len - dop_row.contraction;
                }
                else{
                  coordin = dop_row.contraction;
                }
              }
            }

            const procedure_row = res.add(dop_row);
            procedure_row.origin = this;
            procedure_row.handle_height_max = contour.cnstr;
            if(dop_row.transfer_option == НаПримыкающий){
              const nearest = elm.nearest();
              const {outer} = elm.rays;
              const nouter = nearest.rays.outer;
              const point = outer.getPointAt(outer.getOffsetOf(outer.getNearestPoint(elm.corns(1))) + coordin);
              procedure_row.handle_height_min = nearest.elm;
              procedure_row.coefficient = nouter.getOffsetOf(nouter.getNearestPoint(point)) - nouter.getOffsetOf(nouter.getNearestPoint(nearest.corns(1)));
              // если сказано учесть припуск - добавляем dx0
              if(dop_row.overmeasure){
                procedure_row.coefficient +=  nearest.dx0;
              }
            }
            else{
              procedure_row.handle_height_min = elm.elm;
              procedure_row.coefficient = coordin;
              // если сказано учесть припуск - добавляем dx0
              if(dop_row.overmeasure){
                procedure_row.coefficient +=  elm.dx0;
              }
            }

            return;
          }
          else if(!dop_row.quantity){
            return;
          }

          // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
          if(dop_row.is_set_row){
            dop_row.nom.get_spec(contour, cache).each((sub_row) => {
              if(sub_row.is_procedure_row){
                res.add(sub_row);
              }
              else if(sub_row.quantity) {
                res.add(sub_row).quantity = (row_furn.quantity || 1) * (dop_row.quantity || 1) * sub_row.quantity;
              }
            });
          }
          else{
            res.add(dop_row).origin = this;
          }
        });
      }

      // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
      if(row_furn.is_set_row){
        row_furn.nom.get_spec(contour, cache, exclude_dop).each((sub_row) => {
          if(sub_row.is_procedure_row){
            res.add(sub_row);
          }
          else if(!sub_row.quantity){
            return;
          }
          res.add(sub_row).quantity = (row_furn.quantity || 1) * sub_row.quantity;
        });
      }
      else{
        if(row_furn.quantity){
          const row_spec = res.add(row_furn);
          row_spec.origin = this;
          if(!row_furn.formula.empty() && !row_furn.formula.condition_formula){
            row_furn.formula.execute({ox, contour, row_furn, row_spec});
          }
        }
      }
    });

    return res;
  }

};

/**
 * Методы строки спецификации
 */
$p.CatFurnsSpecificationRow = class CatFurnsSpecificationRow extends $p.CatFurnsSpecificationRow {

  /**
   * Проверяет ограничения строки фурнитуры
   * @param contour {Contour}
   * @param cache {Object}
   */
  check_restrictions(contour, cache) {
    const {elm, dop, handle_height_min, handle_height_max, formula} = this;
    const {direction, h_ruch, cnstr} = contour;

    // проверка по высоте ручки
    if(h_ruch < handle_height_min || (handle_height_max && h_ruch > handle_height_max)){
      return false;
    }

    // проверка по формуле
    if(!cache.ignore_formulas && !formula.empty() && formula.condition_formula && !formula.execute({ox: cache.ox, contour, row_furn: this})) {
      return false;
    }

    // получаем связанные табличные части
    const {selection_params, specification_restrictions} = this._owner._owner;
    const prop_direction = $p.job_prm.properties.direction;

    let res = true;

    // по таблице параметров
    selection_params.find_rows({elm, dop}, (prm_row) => {
      // выполнение условия рассчитывает объект CchProperties
      const ok = (prop_direction == prm_row.param) ?
        direction == prm_row.value : prm_row.param.check_condition({row_spec: this, prm_row, cnstr, ox: cache.ox});
      if(!ok){
        return res = false;
      }
    });

    // по таблице ограничений
    if(res) {

      specification_restrictions.find_rows({elm, dop}, (row) => {
        let len;
        if (contour.is_rectangular) {
          len = (row.side == 1 || row.side == 3) ? cache.w : cache.h;
        }
        else {
          const elm = contour.profile_by_furn_side(row.side, cache);
          len = elm._row.len - 2 * elm.nom.sizefurn;
        }
        if (len < row.lmin || len > row.lmax) {
          return res = false;
        }
      });
    }

    return res;
  }

  get nom() {
    return this._getter('nom')
  }
  set nom (v) {
    if(v !== ""){
      this._setter('nom', v)
    }
  }

  get nom_set() {
    return this.nom;
  }
  set nom_set (v) {
    this.nom = v;
  }

};

// корректируем метаданные табчасти фурнитуры
(({md}) => {
  const {fields} = md.get("cat.furns").tabular_sections.specification;
  fields.nom_set = fields.nom;
})($p);

/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author Evgeniy Malyarov
 * @module cat_inserts
 */

$p.cat.inserts.__define({

	_inserts_types_filling: {
		value: [
			$p.enm.inserts_types.Заполнение
		]
	},

	by_thickness: {
		value: function (min, max) {

			if(!this._by_thickness){
				this._by_thickness = {};
				this.find_rows({insert_type: {in: this._inserts_types_filling}}, (ins) => {
					if(ins.thickness > 0){
						if(!this._by_thickness[ins.thickness])
							this._by_thickness[ins.thickness] = [];
						this._by_thickness[ins.thickness].push(ins);
					}
				});
			}

			const res = [];
			for(let thickness in this._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, this._by_thickness[thickness]);
			}
			return res;

		}
	},

  sql_selection_list_flds: {
	  value: function (initial_value) {
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as insert_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_inserts AS _t_" +
        " left outer join enm_inserts_types as _k_ on _k_.ref = _t_.insert_type %3 %4 LIMIT 300";
    }
  }

});

// переопределяем прототип
$p.CatInserts = class CatInserts extends $p.CatInserts {

  /**
   * Возвращает номенклатуру вставки в завсисмости от свойств элемента
   */
  nom(elm, strict) {

    const {_data} = this;
    if(!strict && _data.nom){
      return _data.nom;
    }

    const main_rows = [];
    let _nom;

    this.specification.find_rows({is_main_elm: true}, (row) => main_rows.push(row));

    if(!main_rows.length && !strict && this.specification.count()){
      main_rows.push(this.specification.get(0))
    }

    if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts){
      if(main_rows[0].nom == this){
        _nom = $p.cat.nom.get()
      }
      else{
        _nom = main_rows[0].nom.nom(elm, strict)
      }
    }
    else if(main_rows.length){
      if(elm && !main_rows[0].formula.empty()){
        try{
          _nom = main_rows[0].formula.execute({elm});
          if(!_nom){
            _nom = main_rows[0].nom
          }
        }catch(e){
          _nom = main_rows[0].nom
        }
      }
      else{
        _nom = main_rows[0].nom
      }
    }
    else{
      _nom = $p.cat.nom.get()
    }

    if(main_rows.length < 2){
      _data.nom = typeof _nom == 'string' ? $p.cat.nom.get(_nom) : _nom;
    }
    else{
      // TODO: реализовать фильтр
      _data.nom = _nom;
    }

    return _data.nom;
  }

  /**
   * Возвращает атрибуты характеристики виртуальной продукции по вставке в контур
   */
  contour_attrs(contour) {

    const main_rows = [];
    const res = {calc_order: contour.project.ox.calc_order};

    this.specification.find_rows({is_main_elm: true}, (row) => {
      main_rows.push(row);
      return false;
    });

    if(main_rows.length){
      const irow = main_rows[0],
        sizes = {},
        sz_keys = {},
        sz_prms = ['length', 'width', 'thickness'].map((name) => {
          const prm = $p.job_prm.properties[name];
          sz_keys[prm.ref] = name;
          return prm;
        });

      // установим номенклатуру продукции
      res.owner = irow.nom instanceof $p.CatInserts ? irow.nom.nom() : irow.nom;

      // если в параметрах вставки задействованы свойства длина и или ширина - габариты получаем из свойств
      contour.project.ox.params.find_rows({
        cnstr: contour.cnstr,
        inset: this,
        param: {in: sz_prms}
      }, (row) => {
        sizes[sz_keys[row.param.ref]] = row.value
      });

      if(Object.keys(sizes).length > 0){
        res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
        res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
        res.s = ((res.x * res.y) / 1000000).round(3);
        res.z = sizes.thickness * (irow.coefficient * 1000 || 1);
      }
      else{
        if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()){
          irow.formula.execute({
            ox: contour.project.ox,
            contour: contour,
            inset: this,
            row_ins: irow,
            res: res
          });
        }
        if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади && this.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
          // получаем габариты смещенного периметра
          const bounds = contour.bounds_inner(irow.sz);
          res.x = bounds.width.round(1);
          res.y = bounds.height.round(1);
          res.s = ((res.x * res.y) / 1000000).round(3);
        }
        else{
          res.x = contour.w + irow.sz;
          res.y = contour.h + irow.sz;
          res.s = ((res.x * res.y) / 1000000).round(3);
        }
      }
    }

    return res;

  }

  /**
   * Проверяет ограничения вставки или строки вставки
   * @param row {CatInserts|CatInsertsSpecificationRow}
   * @param elm {BuilderElement}
   * @param by_perimetr {Boolean}
   * @param len_angl {Object}
   * @return {Boolean}
   */
  check_restrictions(row, elm, by_perimetr, len_angl) {

    const {_row} = elm;
    const len = len_angl ? len_angl.len : _row.len;
    const is_linear = elm.is_linear ? elm.is_linear() : true;
    let is_tabular = true;

    // проверяем площадь
    if(row.smin > _row.s || (_row.s && row.smax && row.smax < _row.s)){
      return false;
    }

    // Главный элемент с нулевым количеством не включаем
    if(row.is_main_elm && !row.quantity){
      return false;
    }

    // только для прямых или только для кривых профилей
    if((row.for_direct_profile_only > 0 && !is_linear) || (row.for_direct_profile_only < 0 && is_linear)){
      return false;
    }

    if($p.utils.is_data_obj(row)){

      if(row.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
        if(!elm.joined_imposts(true)){
          return false;
        }

      }else if(row.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
        if(elm.joined_imposts(true)){
          return false;
        }
      }
      is_tabular = false;
    }


    if(!is_tabular || by_perimetr || row.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
      if(row.lmin > len || (row.lmax < len && row.lmax > 0)){
        return false;
      }
      if(row.ahmin > _row.angle_hor || row.ahmax < _row.angle_hor){
        return false;
      }
    }

    //// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

    return true;
  }

  /**
   * Возвращает спецификацию вставки с фильтром
   * @method filtered_spec
   * @param elm {BuilderElement|Object} - элемент, к которому привязана вставка
   * @param ox {CatCharacteristics} - текущая продукция
   * @param [is_high_level_call] {Boolean} - вызов верхнего уровня - специфично для стеклопакетов
   * @param [len_angl] {Object} - контекст размеров элемента
   * @param [own_row] {CatInsertsSpecificationRow} - родительская строка для вложенных вставок
   * @return {Array}
   */
  filtered_spec({elm, is_high_level_call, len_angl, own_row, ox}) {

    const res = [];

    if(this.empty()){
      return res;
    }

    function fake_row(row) {
      if(row._metadata){
        const res = {};
        for(let fld in row._metadata().fields){
          res[fld] = row[fld];
        }
        return res;
      }
      else{
        return Object.assign({}, row);
      }
    }

    const {insert_type, check_restrictions} = this;
    const {Профиль, Заполнение} = $p.enm.inserts_types;
    const {check_params} = ProductsBuilding;

    // для заполнений, можно переопределить состав верхнего уровня
    if(is_high_level_call && (insert_type == Заполнение)){

      const glass_rows = [];
      ox.glass_specification.find_rows({elm: elm.elm}, (row) => {
        glass_rows.push(row);
      });

      // если спецификация верхнего уровня задана в изделии, используем её, параллельно формируем формулу
      if(glass_rows.length){
        glass_rows.forEach((row) => {
          row.inset.filtered_spec({elm, len_angl, ox}).forEach((row) => {
            res.push(row);
          });
        });
        return res;
      }
    }

    this.specification.each((row) => {

      // Проверяем ограничения строки вставки
      if(!check_restrictions(row, elm, insert_type == Профиль, len_angl)){
        return;
      }

      // Проверяем параметры изделия, контура или элемента
      if(own_row && row.clr.empty() && !own_row.clr.empty()){
        row = fake_row(row);
        row.clr = own_row.clr;
      }
      if(!check_params({
          params: this.selection_params,
          ox: ox,
          elm: elm,
          row_spec: row,
          cnstr: len_angl && len_angl.cnstr,
          origin: len_angl && len_angl.origin,
        })){
        return;
      }

      // Добавляем или разузловываем дальше
      if(row.nom instanceof $p.CatInserts){
        row.nom.filtered_spec({elm, len_angl, ox, own_row: own_row || row}).forEach((subrow) => {
          const fakerow = fake_row(subrow);
          fakerow.quantity = (subrow.quantity || 1) * (row.quantity || 1);
          fakerow.coefficient = (subrow.coefficient || 1) * (row.coefficient || 1);
          fakerow._origin = row.nom;
          if(fakerow.clr.empty()){
            fakerow.clr = row.clr;
          }
          res.push(fakerow);
        });
      }
      else{
        res.push(row);
      }

    });

    return res;
  }

  /**
   * Дополняет спецификацию изделия спецификацией текущей вставки
   * @method calculate_spec
   * @param elm {BuilderElement}
   * @param len_angl {Object}
   * @param ox {CatCharacteristics}
   * @param spec {TabularSection}
   */
  calculate_spec({elm, len_angl, ox, spec}) {

    const {_row} = elm;
    const {ПоПериметру, ПоШагам, ПоФормуле, ДляЭлемента, ПоПлощади} = $p.enm.count_calculating_ways;
    const {profile_items} = $p.enm.elm_types;
    const {new_spec_row, calc_qty_len, calc_count_area_mass} = ProductsBuilding;

    if(!spec){
      spec = ox.specification;
    }

    this.filtered_spec({elm, is_high_level_call: true, len_angl, ox}).forEach((row_ins_spec) => {

      const origin = row_ins_spec._origin || this;

      let row_spec;

      // добавляем строку спецификации, если профиль или не про шагам
      if((row_ins_spec.count_calc_method != ПоПериметру && row_ins_spec.count_calc_method != ПоШагам) || profile_items.indexOf(_row.elm_type) != -1){
        row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
      }

      if(row_ins_spec.count_calc_method == ПоФормуле && !row_ins_spec.formula.empty()){
        // если строка спецификации не добавлена на предыдущем шаге, делаем это сейчас
        row_spec = new_spec_row({row_spec, elm, row_base: row_ins_spec, origin, spec, ox});
      }
      // для вставок в профиль способ расчета количества не учитывается
      else if(profile_items.indexOf(_row.elm_type) != -1 || row_ins_spec.count_calc_method == ДляЭлемента){
        calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
      }
      else{

        if(row_ins_spec.count_calc_method == ПоПлощади){
          row_spec.qty = row_ins_spec.quantity;
          if(this.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
            const bounds = elm.layer.bounds_inner(row_ins_spec.sz);
            row_spec.len = bounds.height * (row_ins_spec.coefficient || 0.001);
            row_spec.width = bounds.width * (row_ins_spec.coefficient || 0.001);
            row_spec.s = (row_spec.len * row_spec.width).round(3);
          }
          else{
            row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.s = _row.s;
          }
        }
        else if(row_ins_spec.count_calc_method == ПоПериметру){
          const row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
          const perimeter = elm.perimeter ? elm.perimeter : (
            this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ? elm.layer.perimeter_inner(row_ins_spec.sz) : elm.layer.perimeter
          )
          perimeter.forEach((rib) => {
            row_prm._row._mixin(rib);
            row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
            if(this.check_restrictions(row_ins_spec, row_prm, true)){
              row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
              // при расчете по периметру, выполняем формулу для каждого ребра периметра
              if(!row_ins_spec.formula.empty()){
                const qty = row_ins_spec.formula.execute({
                  ox: ox,
                  elm: rib.profile || rib,
                  cnstr: len_angl && len_angl.cnstr || 0,
                  inset: (len_angl && len_angl.hasOwnProperty('cnstr')) ? len_angl.origin : $p.utils.blank.guid,
                  row_ins: row_ins_spec,
                  row_spec: row_spec,
                  len: rib.len
                });
              }
              calc_qty_len(row_spec, row_ins_spec, rib.len);
              calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
            }
            row_spec = null;
          });

        }
        else if(row_ins_spec.count_calc_method == ПоШагам){

          const bounds = this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ?
            elm.layer.bounds_inner(row_ins_spec.sz) : {height: _row.y2 - _row.y1, width: _row.x2 - _row.x1};

          const h = (!row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.height : bounds.width);
          const w = !row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.width : bounds.height;
          // (row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
          // row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление)
          if(row_ins_spec.step){
            let qty = 0;
            let pos;
            if(row_ins_spec.do_center && h >= row_ins_spec.step ){
              pos = h / 2;
              if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                qty++;
              }
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                pos = h / 2 + i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
                pos = h / 2 - i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
              }
            }
            else{
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                pos = i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
              }
            }

            if(qty){
              row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
              calc_qty_len(row_spec, row_ins_spec, w);
              row_spec.qty *= qty;
              calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
            }
            row_spec = null;
          }
        }
        else{
          throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
        }
      }

      if(row_spec){
        // выполняем формулу
        if(!row_ins_spec.formula.empty()){
          const qty = row_ins_spec.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: len_angl && len_angl.cnstr || 0,
            inset: (len_angl && len_angl.hasOwnProperty('cnstr')) ? len_angl.origin : $p.utils.blank.guid,
            row_ins: row_ins_spec,
            row_spec: row_spec,
            len: len_angl ? len_angl.len : _row.len
          });
          if(row_ins_spec.count_calc_method == ПоФормуле){
            row_spec.qty = qty;
          }
          else if(row_ins_spec.formula.condition_formula && !qty){
            row_spec.qty = 0;
          }
        }
        calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
      }
    })
  }

  /**
   * Возвращает толщину вставки
   *
   * @property thickness
   * @return {Number}
   */
  get thickness() {

    const {_data} = this;

    if(!_data.hasOwnProperty("thickness")){
      _data.thickness = 0;
      const nom = this.nom(null, true);
      if(nom && !nom.empty()){
        _data.thickness = nom.thickness;
      }
      else{
        this.specification.forEach((row) => {
          _data.thickness += row.nom.thickness;
        });
      }
    }

    return _data.thickness;
  }

  /**
   * Возвращает массив задействованных во вставке параметров
   * @property used_params
   * @return {Array}
   */
  get used_params() {
    const res = [];
    this.selection_params.each((row) => {
      if(!row.param.empty() && res.indexOf(row.param) == -1){
        res.push(row.param)
      }
    });
    return res;
  }

}


/**
 * Дополнительные методы справочника Привязки вставок
 *
 * Created 21.04.2017
 */

$p.cat.insert_bind.__define({

  /**
   * Возвращает массив допвставок с привязками к изделию или слою
   */
  insets: {
    value: function (ox) {
      const {sys, owner} = ox;
      const res = [];
      this.forEach((o) => {
        o.production.forEach((row) => {
          const {nom} = row;
          if(sys._hierarchy(nom) || owner._hierarchy(nom)){
            o.inserts.forEach(({inset, elm_type}) => {
              if(!res.some((irow) => irow.inset == inset &&  irow.elm_type == elm_type)){
                res.push({inset, elm_type});
              }
            });
          }
        })
      })
      return res;
    }
  }

});


/**
 * Дополнительные методы справочника Номенклатура
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 * @module cat_nom
 * Created 23.12.2015
 */

// определяем модификаторы
$p.cat.nom.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		}
	},

	sql_selection_where_flds: {
		value: function(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		}
	}
});

// методы ценообразования в прототип номенклатуры
$p.CatNom.prototype.__define({

	/**
	 * Возвращает цену номенклатуры указанного типа
	 * - на дату
	 * - с подбором характеристики по цвету
	 * - с пересчетом из валюты в валюту
	 */
	_price: {
		value: function (attr) {

      let price = 0, currency, start_date = $p.utils.blank.date;

			if(!attr){
        attr = {};
      }

			if(!attr.price_type){
        attr.price_type = $p.job_prm.pricing.price_type_sale;
      }
			else if($p.utils.is_data_obj(attr.price_type)){
        attr.price_type = attr.price_type.ref;
      }

      const {_price} = this._data;
      const {x, y, z, clr, ref, calc_order} = (attr.characteristic || {});

			if(!attr.characteristic){
        attr.characteristic = $p.utils.blank.guid;
      }
			else if($p.utils.is_data_obj(attr.characteristic)){
			  // если передали уникальную характеристику продкции - ищем простую с тем же цветом и размерами
        // TODO: здесь было бы полезно учесть соответствие цветов??
        attr.characteristic = ref;
        if(!calc_order.empty()){
          const tmp = [];
          const {by_ref} = $p.cat.characteristics;
          for(let clrx in _price) {
            const cx = by_ref[clrx];
            if(cx && cx.clr == clr){
              // если на подходящую характеристику есть цена по нашему типу цен - запоминаем
              if(_price[clrx][attr.price_type]){
                if(cx.x && x && cx.x - x < -10){
                  continue;
                }
                if(cx.y && y && cx.y - y < -10){
                  continue;
                }
                tmp.push({
                  cx,
                  rate: (cx.x && x ? Math.abs(cx.x - x) : 0) + (cx.y && y ? Math.abs(cx.y - y) : 0) + (cx.z && z && cx.z == z ? 1 : 0)
                })
              }
            }
          }
          if(tmp.length){
            tmp.sort((a, b) => a.rate - b.rate);
            attr.characteristic = tmp[0].cx.ref;
          }
        }
			}
			if(!attr.date){
        attr.date = new Date();
      }

      // если для номенклатуры существует структура цен, ищем подходящую
			if(_price){
				if(_price[attr.characteristic]){
					if(_price[attr.characteristic][attr.price_type]){
            _price[attr.characteristic][attr.price_type].forEach((row) => {
							if(row.date > start_date && row.date <= attr.date){
								price = row.price;
								currency = row.currency;
                start_date = row.date;
							}
						})
					}
				}
				// если нет цены на характеристику, ищем по цвету
				else if(attr.clr){
          const {by_ref} = $p.cat.characteristics;
				  for(let clrx in _price){
            const cx = by_ref[clrx];
            if(cx && cx.clr == attr.clr){
              if(_price[clrx][attr.price_type]){
                _price[clrx][attr.price_type].forEach((row) => {
                  if(row.date > start_date && row.date <= attr.date){
                    price = row.price;
                    currency = row.currency;
                    start_date = row.date;
                  }
                })
                break;
              }
            }
          }
        }
      }

      // если есть формула - выполняем вне зависимости от установленной цены
      if(attr.formula){

        // если нет цены на характеристику, ищем цену без характеристики
        if(!price && _price && _price[$p.utils.blank.guid]){
          if(_price[$p.utils.blank.guid][attr.price_type]){
            _price[$p.utils.blank.guid][attr.price_type].forEach((row) => {
              if(row.date > start_date && row.date <= attr.date){
                price = row.price;
                currency = row.currency;
                start_date = row.date;
              }
            })
          }
        }
        // формулу выполняем в любом случае - она может и не опираться на цены из регистра
        price = attr.formula.execute({
          nom: this,
          characteristic: $p.cat.characteristics.get(attr.characteristic, false),
          date: attr.date,
          price, currency, x, y, z, clr, calc_order,
        })
      }

			// Пересчитать из валюты в валюту
			return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

		}
	},

  /**
   * Возвращает значение допреквизита группировка
   */
  grouping: {
	  get: function () {
      if(!this.hasOwnProperty('_grouping')){
        this.extra_fields.find_rows({property: $p.job_prm.properties.grouping}, (row) => {
          this._grouping = row.value.name;
        })
      }
      return this._grouping || '';
    }
  },

  /**
   * Представление объекта
   * @property presentation
   * @for CatObj
   * @type String
   */
  presentation: {
    get : function(){
      return this.name + (this.article ? ' ' + this.article : '');
    },
    set : function(v){
    }
  },

  /**
   * Возвращает номенклатуру по ключу цветового аналога
   */
  by_clr_key: {
    value: function (clr) {

      if(this.clr == clr){
        return this;
      }
      if(!this._clr_keys){
        this._clr_keys = new Map();
      }
      const {_clr_keys} = this;
      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(_clr_keys.size){
        return this;
      }

      // получаем ссылку на ключ цветового аналога
      const clr_key = $p.job_prm.properties.clr_key && $p.job_prm.properties.clr_key.ref;
      let clr_value;
      this.extra_fields.find_rows({property: $p.job_prm.properties.clr_key}, (row) => clr_value = row.value);
      if(!clr_value){
        return this;
      }

      // находим все номенклатуры с подходящим ключем цветового аналога
      this._manager.alatable.forEach((nom) => {
        nom.extra_fields && nom.extra_fields.some((row) => {
          row.property === clr_key && row.value === clr_value &&
            _clr_keys.set($p.cat.clrs.get(nom.clr), $p.cat.nom.get(nom.ref));
        })
      });

      // возарвщаем подходящую или себя
      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(!_clr_keys.size){
        _clr_keys.set(0, 0);
      }
      return this;
    }
  }

});

/**
 * ### Дополнительные методы справочника Контрагенты
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_partners
 */

$p.cat.partners.__define({

	sql_selection_where_flds: {
		value: function(filter){
			return " OR inn LIKE '" + filter + "' OR name_full LIKE '" + filter + "' OR name LIKE '" + filter + "'";
		}
	}
});

$p.CatPartners.prototype.__define({

	addr: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.presentation && (
						row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресКонтрагента") ||
						row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресКонтрагента")
					))
					return row.presentation;

			}, "")

		}
	},

	phone: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагентаМобильный") && row.presentation)
					return row.presentation;

			}, "")
		}
	},

	// полное наименование с телефоном, адресом и банковским счетом
	long_presentation: {
		get: function () {
			var res = this.name_full || this.name,
				addr = this.addr,
				phone = this.phone;

			if(this.inn)
				res+= ", ИНН" + this.inn;

			if(this.kpp)
				res+= ", КПП" + this.kpp;

			if(addr)
				res+= ", " + addr;

			if(phone)
				res+= ", " + phone;

			return res;
		}
	}
});

/**
 * Дополнительные методы справочника Системы (Параметры продукции)
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author Evgeniy Malyarov
 * @module cat_production_params
 */

$p.cat.production_params.__define({

	/**
	 * возвращает массив доступных для данного свойства значений
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param is_furn {boolean} - интересуют свойства фурнитуры или объекта
	 * @return {Array}
	 */
	slist: function(prop, is_furn){
		var res = [], rt, at, pmgr,
			op = this.get(prop);

		if(op && op.type.is_ref){
			// параметры получаем из локального кеша
			for(rt in op.type.types)
				if(op.type.types[rt].indexOf(".") > -1){
					at = op.type.types[rt].split(".");
					pmgr = $p[at[0]][at[1]];
					if(pmgr){
						if(pmgr.class_name=="enm.open_directions")
							pmgr.each(function(v){
								if(v.name!=$p.enm.tso.folding)
									res.push({value: v.ref, text: v.synonym});
							});
						else
							pmgr.find_rows({owner: prop}, function(v){
								res.push({value: v.ref, text: v.presentation});
							});
					}
				}
		}
		return res;
	}
});

$p.CatProduction_params.prototype.__define({

	/**
	 * возвращает доступные в данной системе элементы
	 * @property noms
	 * @for Production_params
	 */
	noms: {
		get: function(){
			var __noms = [];
			this.elmnts._obj.forEach(function(row){
				if(!$p.utils.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1)
					__noms.push(row.nom);
			});
			return __noms;
		}
	},

	/**
	 * возвращает доступные в данной системе элементы (вставки)
	 * @property inserts
	 * @for Production_params
	 * @param elm_types - допустимые типы элементов
	 * @param by_default {Boolean|String} - сортировать по признаку умолчания или по наименованию вставки
	 * @return Array.<_cat.inserts>
	 */
	inserts: {
		value: function(elm_types, by_default){
			var __noms = [];
			if(!elm_types)
				elm_types = $p.enm.elm_types.rama_impost;

			else if(typeof elm_types == "string")
				elm_types = $p.enm.elm_types[elm_types];

			else if(!Array.isArray(elm_types))
				elm_types = [elm_types];

			this.elmnts.each((row) => {
				if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
					(by_default == "rows" || !__noms.some((e) => row.nom == e.nom)))
					__noms.push(row);
			});

			if(by_default == "rows")
				return __noms;

			__noms.sort(function (a, b) {

				if(by_default){

					if (a.by_default && !b.by_default)
						return -1;
					else if (!a.by_default && b.by_default)
						return 1;
					else
						return 0;

				}else{
					if (a.nom.name < b.nom.name)
						return -1;
					else if (a.nom.name > b.nom.name)
						return 1;
					else
						return 0;
				}
			});
			return __noms.map((e) => e.nom);
		}
	},

	/**
	 * @method refill_prm
	 * @for cat.Production_params
	 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
	 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
	 */
	refill_prm: {
		value: function (ox, cnstr = 0) {

			const prm_ts = !cnstr ? this.product_params : this.furn_params;
			const adel = [];
			const auto_align = ox.calc_order.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон && $p.job_prm.properties.auto_align;
			const {params} = ox;

			function add_prm(default_row) {
        let row;
        params.find_rows({cnstr: cnstr, param: default_row.param}, (_row) => {
          row = _row;
          return false;
        });

        // если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
        if(!row){
          if(cnstr){
            return;
          }
          row = params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});
        }

        if(row.hide != default_row.hide){
          row.hide = default_row.hide;
        }

        if(default_row.forcibly && row.value != default_row.value){
          row.value = default_row.value;
        }
      }

			// если в характеристике есть лишние параметры - удаляем
			if(!cnstr){
        params.find_rows({cnstr: cnstr}, (row) => {
				  const {param} = row;
					if(param !== auto_align && prm_ts.find_rows({param}).length == 0){
            adel.push(row);
          }
				});
				adel.forEach((row) => params.del(row));
			}

			// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
			prm_ts.forEach(add_prm);

			// для шаблонов, добавляем параметр автоуравнивание
      !cnstr && auto_align && add_prm({param: auto_align, value: '', hide: false});

      // устанавливаем систему и номенклатуру продукции
			if(!cnstr){
				ox.sys = this;
				ox.owner = ox.prod_nom;

				// одновременно, перезаполним параметры фурнитуры
				ox.constructions.forEach((row) => !row.furn.empty() && ox.sys.refill_prm(ox, row.cnstr))
			}
		}
	}

});


/**
 * ### Модуль менеджера и документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order
 */

(function (_mgr) {

  // переопределяем формирование списка выбора
  _mgr.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

  // переопределяем объекты назначения дополнительных реквизитов
  _mgr._destinations_condition = {predefined_name: {in: ['Документ_Расчет', 'Документ_ЗаказПокупателя']}};

  // индивидуальная строка поиска
  _mgr.build_search = function (tmp, obj) {

    const {number_internal, client_of_dealer, partner, note} = obj;

    tmp.search = (obj.number_doc +
      (number_internal ? ' ' + number_internal : '') +
      (client_of_dealer ? ' ' + client_of_dealer : '') +
      (partner.name ? ' ' + partner.name : '') +
      (note ? ' ' + note : '')).toLowerCase();
  };

  // метод загрузки шаблонов
  _mgr.load_templates = async function () {

    if(!$p.job_prm.builder) {
      $p.job_prm.builder = {};
    }
    if(!$p.job_prm.builder.base_block) {
      $p.job_prm.builder.base_block = [];
    }
    if(!$p.job_prm.pricing) {
      $p.job_prm.pricing = {};
    }

    // дополним base_block шаблонами из систем профилей
    const {base_block} = $p.job_prm.builder;
    $p.cat.production_params.forEach((o) => {
      if(!o.is_folder) {
        o.base_blocks.forEach((row) => {
          if(base_block.indexOf(row.calc_order) == -1) {
            base_block.push(row.calc_order);
          }
        });
      }
    });

    // загрузим шаблоны пачками по 10 документов
    const refs = [];
    for (let o of base_block) {
      refs.push(o.ref);
      if(refs.length > 9) {
        await _mgr.adapter.load_array(_mgr, refs);
        refs.length = 0;
      }
    }
    if(refs.length) {
      await _mgr.adapter.load_array(_mgr, refs);
    }

    // загружаем характеристики из первых строк шаблонов - нужны для фильтра по системам
    refs.length = 0;
    base_block.forEach(({production}) => {
      if(production.count()) {
        refs.push(production.get(0).characteristic.ref);
      }
    });
    return $p.cat.characteristics.adapter.load_array($p.cat.characteristics, refs);

  };

})($p.doc.calc_order);


// свойства и методы объекта
$p.DocCalc_order = class DocCalc_order extends $p.DocCalc_order {

  // подписки на события

  // после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
  after_create() {

    const {enm, cat, current_user, DocCalc_order} = $p;
    const {acl_objs} = current_user;

    //Организация
    acl_objs.find_rows({by_default: true, type: cat.organizations.class_name}, (row) => {
      this.organization = row.acl_obj;
      return false;
    });

    //Подразделение
    DocCalc_order.set_department.call(this);

    //Контрагент
    acl_objs.find_rows({by_default: true, type: cat.partners.class_name}, (row) => {
      this.partner = row.acl_obj;
      return false;
    });

    //Договор
    this.contract = cat.contracts.by_partner_and_org(this.partner, this.organization);

    //Менеджер
    this.manager = current_user;

    //СостояниеТранспорта
    this.obj_delivery_state = enm.obj_delivery_states.Черновик;

    //Номер документа
    return this.new_number_doc();

  }

  // перед записью надо присвоить номер для нового и рассчитать итоги
  before_save() {

    const {Отклонен, Отозван, Шаблон, Подтвержден, Отправлен} = $p.enm.obj_delivery_states;

    let doc_amount = 0,
      amount_internal = 0;

    // если установлен признак проведения, проверим состояние транспорта
    if(this.posted) {
      if(this.obj_delivery_state == Отклонен || this.obj_delivery_state == Отозван || this.obj_delivery_state == Шаблон) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Нельзя провести заказ со статусом<br/>"Отклонён", "Отозван" или "Шаблон"',
          title: this.presentation
        });
        return false;
      }
      else if(this.obj_delivery_state != Подтвержден) {
        this.obj_delivery_state = Подтвержден;
      }
    }
    else if(this.obj_delivery_state == Подтвержден) {
      this.obj_delivery_state = Отправлен;
    }

    // проверим заполненность подразделения
    if(this.obj_delivery_state == Шаблон) {
      this.department = $p.utils.blank.guid;
    }
    else if(this.department.empty()) {
      $p.msg.show_msg && $p.msg.show_msg({
        type: 'alert-warning',
        text: 'Не заполнен реквизит "офис продаж" (подразделение)',
        title: this.presentation
      });
      return false;
    }

    this.production.forEach((row) => {

      doc_amount += row.amount;
      amount_internal += row.amount_internal;

      // if(!row.characteristic.calc_order.empty()) {
      //   const name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
      //   if(sys_profile.indexOf(name) == -1) {
      //     if(sys_profile) {
      //       sys_profile += ' ';
      //     }
      //     sys_profile += name;
      //   }
      //
      //   row.characteristic.constructions.forEach((row) => {
      //   	if(row.parent && !row.furn.empty()){
      //   		const name = row.furn.name_short || row.furn.name;
      //   		if(sys_furn.indexOf(name) == -1){
      //   			if(sys_furn)
      //   				sys_furn += " ";
      //   			sys_furn += name;
      //   		}
      //   	}
      //   });
      // }
    });

    const {rounding} = this;

    this.doc_amount = doc_amount.round(rounding);
    this.amount_internal = amount_internal.round(rounding);
    //this.sys_profile = sys_profile;
    //this.sys_furn = sys_furn;
    this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency).round(rounding);

    const {_obj, obj_delivery_state, category} = this;

    // фильтр по статусу
    if(obj_delivery_state == 'Шаблон') {
      _obj.state = 'template';
    }
    else if(category == 'service') {
      _obj.state = 'service';
    }
    else if(category == 'complaints') {
      _obj.state = 'complaints';
    }
    else if(obj_delivery_state == 'Отправлен') {
      _obj.state = 'sent';
    }
    else if(obj_delivery_state == 'Отклонен') {
      _obj.state = 'declined';
    }
    else if(obj_delivery_state == 'Подтвержден') {
      _obj.state = 'confirmed';
    }
    else if(obj_delivery_state == 'Архив') {
      _obj.state = 'zarchive';
    }
    else {
      _obj.state = 'draft';
    }

    // пометим на удаление неиспользуемые характеристики
    // этот кусок не влияет на возвращаемое before_save значение и выполняется асинхронно
    this._manager.pouch_db.query('svgs', {startkey: [this.ref, 0], endkey: [this.ref, 10e9]})
      .then(({rows}) => {
        const deleted = [];
        for (const {id} of rows) {
          const ref = id.substr(20);
          if(this.production.find_rows({characteristic: ref}).length) {
            continue;
          }
          deleted.push($p.cat.characteristics.get(ref, 'promise')
            .then((ox) => !ox._deleted && ox.mark_deleted(true)));
        }
        return Promise.all(deleted);
      })
      .then((res) => {
        res.length && this._manager.emit_async('svgs', this);
      })
      .catch((err) => null);

  }

  // при изменении реквизита
  value_change(field, type, value) {
    if(field == 'organization') {
      this.new_number_doc();
      if(this.contract.organization != value) {
        this.contract = $p.cat.contracts.by_partner_and_org(this.partner, value);
      }
    }
    else if(field == 'partner' && this.contract.owner != value) {
      this.contract = $p.cat.contracts.by_partner_and_org(value, this.organization);
    }
    // если изменение инициировано человеком, дополним список изменённых полей
    this._manager.emit_add_fields(this, ['contract']);

  }


  /**
   * Возвращает валюту документа
   */
  get doc_currency() {
    const currency = this.contract.settlements_currency;
    return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
  }

  set doc_currency(v) {

  }

  get rounding() {
    const {pricing} = $p.job_prm;
    if(!pricing.hasOwnProperty('rounding')) {
      const parts = this.doc_currency.parameters_russian_recipe.split(',');
      pricing.rounding = parseInt(parts[parts.length - 1]);
      if(isNaN(pricing.rounding)) {
        pricing.rounding = 2;
      }
    }
    return pricing.rounding;
  }

  /**
   * При установке договора, синхронно устанавливаем параметры НДС
   */
  get contract() {
    return this._getter('contract');
  }

  set contract(v) {
    this._setter('contract', v);
    this.vat_consider = this.contract.vat_consider;
    this.vat_included = this.contract.vat_included;
  }

  /**
   * рассчитывает итоги диспетчеризации
   * @return {Promise.<TResult>|*}
   */
  dispatching_totals() {
    var options = {
      reduce: true,
      limit: 10000,
      group: true,
      keys: []
    };
    this.production.forEach(function (row) {
      if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {
        options.keys.push([row.characteristic.ref, '305e374b-3aa9-11e6-bf30-82cf9717e145', 1, 0]);
      }
    });

    return $p.wsql.pouch.remote.doc.query('server/dispatching', options)
      .then(function (result) {
        var res = {};
        result.rows.forEach(function (row) {
          if(row.value.plan) {
            row.value.plan = moment(row.value.plan).format('L');
          }
          if(row.value.fact) {
            row.value.fact = moment(row.value.fact).format('L');
          }
          res[row.key[0]] = row.value;
        });
        return res;
      });
  }

  /**
   * Возвращает данные для печати
   */
  print_data(attr = {}) {
    const {organization, bank_account, partner, contract, manager} = this;
    const {individual_person} = manager;
    const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
    const get_imgs = [];
    const {cat: {contact_information_kinds, characteristics}, utils: {blank, blob_as_text}} = $p;

    // заполняем res теми данными, которые доступны синхронно
    const res = {
      АдресДоставки: this.shipping_address,
      ВалютаДокумента: this.doc_currency.presentation,
      ДатаЗаказаФорматD: moment(this.date).format('L'),
      ДатаЗаказаФорматDD: moment(this.date).format('LL'),
      ДатаТекущаяФорматD: moment().format('L'),
      ДатаТекущаяФорматDD: moment().format('LL'),
      ДоговорДатаФорматD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('L'),
      ДоговорДатаФорматDD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('LL'),
      ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
      ДоговорСрокДействия: moment(contract.validity).format('L'),
      ЗаказНомер: this.number_doc,
      //Примечание (комментарий) к расчету  и внутренний номер расчет-заказа
      Примечание: this.note,
      НомерВнутренний: this.number_internal,
      Контрагент: partner.presentation,
      КонтрагентОписание: partner.long_presentation,
      КонтрагентДокумент: '',
      КонтрагентКЛДолжность: '',
      КонтрагентКЛДолжностьРП: '',
      КонтрагентКЛИмя: '',
      КонтрагентКЛИмяРП: '',
      КонтрагентКЛК: '',
      КонтрагентКЛОснованиеРП: '',
      КонтрагентКЛОтчество: '',
      КонтрагентКЛОтчествоРП: '',
      КонтрагентКЛФамилия: '',
      КонтрагентКЛФамилияРП: '',
      КонтрагентИНН: partner.inn,
      КонтрагентКПП: partner.kpp,
      КонтрагентЮрФизЛицо: '',
      КратностьВзаиморасчетов: this.settlements_multiplicity,
      КурсВзаиморасчетов: this.settlements_course,
      ЛистКомплектацииГруппы: '',
      ЛистКомплектацииСтроки: '',
      Организация: organization.presentation,
      ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, '') || 'Москва',
      ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ЮрАдресОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.presentation && (
            row.kind == contact_information_kinds.predefined('ФактАдресОрганизации') ||
            row.kind == contact_information_kinds.predefined('ПочтовыйАдресОрганизации')
          )) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ТелефонОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.kind == contact_information_kinds.predefined('ФаксОрганизации') && row.presentation) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияБанкБИК: our_bank_account.bank.id,
      ОрганизацияБанкГород: our_bank_account.bank.city,
      ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
      ОрганизацияБанкНаименование: our_bank_account.bank.name,
      ОрганизацияБанкНомерСчета: our_bank_account.account_number,
      ОрганизацияИндивидуальныйПредприниматель: organization.individual_entrepreneur.presentation,
      ОрганизацияИНН: organization.inn,
      ОрганизацияКПП: organization.kpp,
      ОрганизацияСвидетельствоДатаВыдачи: organization.certificate_date_issue,
      ОрганизацияСвидетельствоКодОргана: organization.certificate_authority_code,
      ОрганизацияСвидетельствоНаименованиеОргана: organization.certificate_authority_name,
      ОрганизацияСвидетельствоСерияНомер: organization.certificate_series_number,
      ОрганизацияЮрФизЛицо: organization.individual_legal.presentation,
      ПродукцияЭскизы: {},
      Проект: this.project.presentation,
      СистемыПрофилей: this.sys_profile,
      СистемыФурнитуры: this.sys_furn,
      Сотрудник: manager.presentation,
      СотрудникКомментарий: manager.note,
      СотрудникДолжность: individual_person.Должность || 'менеджер',
      СотрудникДолжностьРП: individual_person.ДолжностьРП,
      СотрудникИмя: individual_person.Имя,
      СотрудникИмяРП: individual_person.ИмяРП,
      СотрудникОснованиеРП: individual_person.ОснованиеРП,
      СотрудникОтчество: individual_person.Отчество,
      СотрудникОтчествоРП: individual_person.ОтчествоРП,
      СотрудникФамилия: individual_person.Фамилия,
      СотрудникФамилияРП: individual_person.ФамилияРП,
      СотрудникФИО: individual_person.Фамилия +
      (individual_person.Имя ? ' ' + individual_person.Имя[1].toUpperCase() + '.' : '' ) +
      (individual_person.Отчество ? ' ' + individual_person.Отчество[1].toUpperCase() + '.' : ''),
      СотрудникФИОРП: individual_person.ФамилияРП + ' ' + individual_person.ИмяРП + ' ' + individual_person.ОтчествоРП,
      СуммаДокумента: this.doc_amount.toFixed(2),
      СуммаДокументаПрописью: this.doc_amount.in_words(),
      СуммаДокументаБезСкидки: this.production._obj.reduce((val, row) => val + row.quantity * row.price, 0).toFixed(2),
      СуммаСкидки: this.production._obj.reduce((val, row) => val + row.discount, 0).toFixed(2),
      СуммаНДС: this.production._obj.reduce((val, row) => val + row.vat_amount, 0).toFixed(2),
      ТекстНДС: this.vat_consider ? (this.vat_included ? 'В том числе НДС 18%' : 'НДС 18% (сверху)') : 'Без НДС',
      ТелефонПоАдресуДоставки: this.phone,
      СуммаВключаетНДС: contract.vat_included,
      УчитыватьНДС: contract.vat_consider,
      ВсегоНаименований: this.production.count(),
      ВсегоИзделий: 0,
      ВсегоПлощадьИзделий: 0,
      Продукция: [],
      Аксессуары: [],
      Услуги: [],
      НомерВнутр: this.number_internal,
      КлиентДилера: this.client_of_dealer,
      Комментарий: this.note,
    };

    // дополняем значениями свойств
    this.extra_fields.forEach((row) => {
      res['Свойство' + row.property.name.replace(/\s/g, '')] = row.value.presentation || row.value;
    });

    // TODO: дополнить датами доставки и монтажа
    res.МонтажДоставкаСамовывоз = !this.shipping_address ? 'Самовывоз' : 'Монтаж по адресу: ' + this.shipping_address;

    // получаем логотип организации
    for (let key in organization._attachments) {
      if(key.indexOf('logo') != -1) {
        get_imgs.push(organization.get_attachment(key)
          .then((blob) => {
            return blob_as_text(blob, blob.type.indexOf('svg') == -1 ? 'data_url' : '');
          })
          .then((data_url) => {
            res.ОрганизацияЛоготип = data_url;
          })
          .catch($p.record_log));
        break;
      }
    }

    // получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
    this.production.forEach((row) => {
      if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {

        res.Продукция.push(this.row_description(row));

        res.ВсегоИзделий += row.quantity;
        res.ВсегоПлощадьИзделий += row.quantity * row.s;

        // если запросили эскиз без размерных линий или с иными параметрами...
        if(attr.sizes === false) {

        }
        else {
          get_imgs.push(characteristics.get_attachment(row.characteristic.ref, 'svg')
            .then(blob_as_text)
            .then((svg_text) => res.ПродукцияЭскизы[row.characteristic.ref] = svg_text)
            .catch((err) => err && err.status != 404 && $p.record_log(err))
          );
        }
      }
      else if(!row.nom.is_procedure && !row.nom.is_service && row.nom.is_accessory) {
        res.Аксессуары.push(this.row_description(row));
      }
      else if(!row.nom.is_procedure && row.nom.is_service && !row.nom.is_accessory) {
        res.Услуги.push(this.row_description(row));
      }
    });
    res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

    return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
      .then(() => $p.load_script('/dist/qrcodejs/qrcode.min.js', 'script'))
      .then(() => {

        const svg = document.createElement('SVG');
        svg.innerHTML = '<g />';
        const qrcode = new QRCode(svg, {
          text: 'http://www.oknosoft.ru/zd/',
          width: 100,
          height: 100,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
          useSVG: true
        });
        res.qrcode = svg.innerHTML;

        return res;
      });
  }

  /**
   * Возвращает струклуру с описанием строки продукции для печати
   */
  row_description(row) {

    if(!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic) {
      this.production.find_rows({characteristic: row.characteristic}, (prow) => {
        row = prow;
        return false;
      });
    }
    const {characteristic, nom} = row;
    const res = {
      ref: characteristic.ref,
      НомерСтроки: row.row,
      Количество: row.quantity,
      Ед: row.unit.name || 'шт',
      Цвет: characteristic.clr.name,
      Размеры: row.len + 'x' + row.width + ', ' + row.s + 'м²',
      Площадь: row.s,
      //Отдельно размеры, общая площадь позиции и комментарий к позиции
      Длинна: row.len,
      Ширина: row.width,
      ВсегоПлощадь: row.s * row.quantity,
      Примечание: row.note,
      Номенклатура: nom.name_full || nom.name,
      Характеристика: characteristic.name,
      Заполнения: '',
      Фурнитура: '',
      Параметры: [],
      Цена: row.price,
      ЦенаВнутр: row.price_internal,
      СкидкаПроцент: row.discount_percent,
      СкидкаПроцентВнутр: row.discount_percent_internal,
      Скидка: row.discount.round(2),
      Сумма: row.amount.round(2),
      СуммаВнутр: row.amount_internal.round(2)
    };

    // формируем описание заполнений
    characteristic.glasses.forEach((row) => {
      const {name} = row.nom;
      if(res.Заполнения.indexOf(name) == -1) {
        if(res.Заполнения) {
          res.Заполнения += ', ';
        }
        res.Заполнения += name;
      }
    });

    // наименования фурнитур
    characteristic.constructions.forEach((row) => {
      const {name} = row.furn;
      if(name && res.Фурнитура.indexOf(name) == -1) {
        if(res.Фурнитура) {
          res.Фурнитура += ', ';
        }
        res.Фурнитура += name;
      }
    });

    // параметры, помеченные к включению в описание
    const params = new Map();
    characteristic.params.forEach((row) => {
      if(row.param.include_to_description) {
        params.set(row.param, row.value);
      }
    });
    for (let [param, value] of params) {
      res.Параметры.push({
        param: param.presentation,
        value: value.presentation || value
      });
    }

    return res;
  }

  /**
   * Заполняет табчасть планирования запросом к сервису windowbuilder-planning
   */
  fill_plan() {

    // чистим не стесняясь - при записи всё равно перезаполнять
    this.planning.clear();

    // получаем url сервиса
    const {wsql, aes, current_user: {suffix}, msg} = $p;
    const url = (wsql.get_user_param('windowbuilder_planning', 'string') || '/plan/') + `doc.calc_order/${this.ref}`;

    // сериализуем документ и характеристики
    const post_data = this._obj._clone();
    post_data.characteristics = {};

    // получаем объекты характеристик и подклеиваем их сериализацию к post_data
    this.load_production()
      .then((prod) => {
        for (const cx of prod) {
          post_data.characteristics[cx.ref] = cx._obj._clone();
        }
      })
      // выполняем запрос к сервису
      .then(() => {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(
          wsql.get_user_param('user_name') + ':' + aes.Ctr.decrypt(wsql.get_user_param('user_pwd'))))));
        if(suffix){
          headers.append('suffix', suffix);
        }
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(post_data)
        })
          .then(response => response.json())
          // заполняем табчасть
          .then(json => {
            if (json.rows) {
              this.planning.load(json.rows)
            }
            else{
              console.log(json)
            }
          })
          .catch(err => {
            msg.show_msg({
              type: "alert-warning",
              text: err.message,
              title: "Сервис планирования"
            });
            $p.record_log(err);
          });
      });

  }

  /**
   * Выясняет, можно ли редактировать данный объект
   */
  get is_read_only() {
    const {obj_delivery_state, posted, _deleted} = this;
    const {Черновик, Шаблон, Отозван} = $p.enm.obj_delivery_states;
    let ro = false;
    // технолог может изменять шаблоны
    if(obj_delivery_state == Шаблон) {
      ro = !$p.current_user.role_available('ИзменениеТехнологическойНСИ');
    }
    // ведущий менеджер может изменять проведенные
    else if(posted || _deleted) {
      ro = !$p.current_user.role_available('СогласованиеРасчетовЗаказов');
    }
    else if(!obj_delivery_state.empty()) {
      ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
    }
    return ro;
  }

  /**
   * Загружает в RAM данные характеристик продукций заказа
   * @return {Promise.<TResult>|*}
   */
  load_production(forse) {
    const prod = [];
    const {characteristics} = $p.cat;
    this.production.forEach(({nom, characteristic}) => {
      if(!characteristic.empty() && (forse || characteristic.is_new()) && !nom.is_procedure && !nom.is_accessory) {
        prod.push(characteristic.ref);
      }
    });
    return characteristics.adapter.load_array(characteristics, prod)
      .then(() => {
        prod.length = 0;
        this.production.forEach(({nom, characteristic}) => {
          if(!characteristic.empty() && !nom.is_procedure && !nom.is_accessory) {
            prod.push(characteristic);
          }
        });
        return prod;
      });
  }

  /**
   * Обработчик события _ЗаписанаХарактеристикаПостроителя_
   * @param scheme
   * @param sattr
   */
  characteristic_saved(scheme, sattr) {
    const {ox, _dp} = scheme;
    const row = ox.calc_order_row;

    if(!row || ox.calc_order != this) {
      return;
    }

    //nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
    //discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

    row._data._loading = true;
    row.nom = ox.owner;
    row.note = _dp.note;
    row.quantity = _dp.quantity || 1;
    row.len = ox.x;
    row.width = ox.y;
    row.s = ox.s;
    row.discount_percent = _dp.discount_percent;
    row.discount_percent_internal = _dp.discount_percent_internal;
    if(row.unit.owner != row.nom) {
      row.unit = row.nom.storage_unit;
    }
    row._data._loading = false;
  }

  /**
   * Создаёт строку заказа с уникальной характеристикой
   * @param row_spec
   * @param elm
   * @param len_angl
   * @param params
   * @param create
   * @param grid
   * @return {Promise.<TResult>}
   */
  create_product_row({row_spec, elm, len_angl, params, create, grid}) {

    const row = row_spec instanceof $p.DpBuyers_orderProductionRow && !row_spec.characteristic.empty() && row_spec.characteristic.calc_order === this ?
      row_spec.characteristic.calc_order_row :
      this.production.add({
        qty: 1,
        quantity: 1,
        discount_percent_internal: $p.wsql.get_user_param('discount_percent_internal', 'number')
      });

    if(grid) {
      this.production.sync_grid(grid);
      grid.selectRowById(row.row);
    }

    if(!create) {
      return row;
    }

    // ищем объект продукции в RAM или берём из строки заказа
    const mgr = $p.cat.characteristics;
    let cx;
    function fill_cx(ox) {
      if(ox._deleted){
        return;
      }
      for (let ts in mgr.metadata().tabular_sections) {
        ox[ts].clear();
      }
      ox.leading_elm = 0;
      ox.leading_product = '';
      cx = Promise.resolve(ox);
      return false;
    }
    if(row.characteristic.empty()){
      mgr.find_rows({calc_order: this, product: row.row}, fill_cx);
    }
    else if(!row.characteristic._deleted){
      fill_cx(row.characteristic);
    }

    // если не нашли в RAM, создаём объект продукции, но из базы не читаем и пока не записываем
    return (cx || mgr.create({
      ref: $p.utils.generate_guid(),
      calc_order: this,
      product: row.row
    }, true))
      .then((ox) => {
        // если указана строка-генератор, заполняем реквизиты
        if(row_spec instanceof $p.DpBuyers_orderProductionRow) {
          ox.owner = row_spec.inset.nom(elm, true);
          ox.origin = row_spec.inset;
          ox.x = row_spec.len;
          ox.y = row_spec.height;
          ox.z = row_spec.depth;
          ox.s = row_spec.s || row_spec.len * row_spec.height / 1000000;
          ox.clr = row_spec.clr;
          ox.note = row_spec.note;

          if(params) {
            params.find_rows({elm: row_spec.row}, (prow) => {
              ox.params.add(prow, true).inset = row_spec.inset;
            });
          }
        }

        // устанавливаем свойства в строке заказа
        Object.assign(row._obj, {
          characteristic: ox.ref,
          nom: ox.owner.ref,
          unit: ox.owner.storage_unit.ref,
          len: ox.x,
          width: ox.y,
          s: ox.s,
          qty: (row_spec && row_spec.quantity) || 1,
          quantity: (row_spec && row_spec.quantity) || 1,
          note: ox.note,
        });

        ox.name = ox.prod_name();

        // записываем расчет, если не сделали этого ранее, чтобы не погибла ссылка на расчет в характеристике
        return this.is_new() && !$p.wsql.alasql.utils.isNode ? this.save().then(() => row) : row;
      });

  }

  /**
   * ### Создаёт продукции заказа по массиву строк и параметров
   * если в dp.production заполнены уникальные характеристики - перезаполняет их, а новые не создаёт
   * @method process_add_product_list
   * @param dp {DpBuyers_order} - экземпляр обработки с заполненными табличными частями
   */
  process_add_product_list(dp) {

    return new Promise(async (resolve, reject) => {

      const ax = [];

      for (let i = 0; i < dp.production.count(); i++) {
        const row_spec = dp.production.get(i);
        let row_prod;

        if(row_spec.inset.empty()) {
          row_prod = this.production.add(row_spec);
          row_prod.unit = row_prod.nom.storage_unit;
          if(!row_spec.clr.empty()) {
            // ищем цветовую характеристику
            $p.cat.characteristics.find_rows({owner: row_spec.nom}, (ox) => {
              if(ox.clr == row_spec.clr) {
                row_prod.characteristic = ox;
                return false;
              }
            });
          }
        }
        else {
          // рассчитываем спецификацию по текущей вставке
          const len_angl = new $p.DocCalc_order.FakeLenAngl(row_spec);
          const elm = new $p.DocCalc_order.FakeElm(row_spec);
          // создаём или получаем строку заказа с уникальной харктеристикой
          row_prod = await this.create_product_row({row_spec, elm, len_angl, params: dp.product_params, create: true});
          row_spec.inset.calculate_spec({elm, len_angl, ox: row_prod.characteristic});

          // сворачиваем
          row_prod.characteristic.specification.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');
        }

        // производим дополнительную корректировку спецификации и рассчитываем цены
        [].push.apply(ax, $p.spec_building.specification_adjustment({
          //scheme: scheme,
          calc_order_row: row_prod,
          spec: row_prod.characteristic.specification,
          save: true,
        }, true));

      }

      resolve(ax);

    });
  }

  /**
   * Устанавливает подразделение по умолчанию
   */
  static set_department() {
    const department = $p.wsql.get_user_param('current_department');
    if(department) {
      this.department = department;
    }
    const {current_user, cat} = $p;
    if(this.department.empty() || this.department.is_new()) {
      current_user.acl_objs && current_user.acl_objs.find_rows({by_default: true, type: cat.divisions.class_name}, (row) => {
        if(this.department != row.acl_obj) {
          this.department = row.acl_obj;
        }
        return false;
      });
    }
  }

};

$p.DocCalc_order.FakeElm = class FakeElm {

  constructor(row_spec) {
    this.row_spec = row_spec;
  }

  get elm() {
    return 0;
  }

  get angle_hor() {
    return 0;
  }

  get _row() {
    return this;
  }

  get clr() {
    return this.row_spec.clr;
  }

  get len() {
    return this.row_spec.len;
  }

  get height() {
    const {height, width} = this.row_spec;
    return height === undefined ? width : height;
  }

  get depth() {
    return this.row_spec.depth || 0;
  }

  get s() {
    return this.row_spec.s;
  }

  get perimeter() {
    const {len, height, width} = this.row_spec;
    return [{len, angle: 0}, {len: height === undefined ? width : height, angle: 90}];
  }

  get x1() {
    return 0;
  }

  get y1() {
    return 0;
  }

  get x2() {
    return this.height;
  }

  get y2() {
    return this.len;
  }

}

$p.DocCalc_order.FakeLenAngl = class FakeLenAngl {

  constructor({len, inset}) {
    this.len = len;
    this.origin = inset;
  }

  get angle() {
    return 0;
  }

  get alp1() {
    return 0;
  }

  get alp2() {
    return 0;
  }

  get cnstr() {
    return 0;
  }

}

// свойства и методы табчасти продукции
$p.DocCalc_orderProductionRow = class DocCalc_orderProductionRow extends $p.DocCalc_orderProductionRow {

  // при изменении реквизита
  value_change(field, type, value, no_extra_charge) {

    let {_obj, _owner, nom, characteristic, unit} = this;
    let recalc;
    const {rounding, _slave_recalc} = _owner._owner;
    const rfield = $p.DocCalc_orderProductionRow.rfields[field];

    if(rfield) {

      _obj[field] = rfield === 'n' ? parseFloat(value) : '' + value;

      nom = this.nom;
      characteristic = this.characteristic;

      // проверим владельца характеристики
      if(!characteristic.empty()) {
        if(!characteristic.calc_order.empty() && characteristic.owner != nom) {
          characteristic.owner = nom;
        }
        else if(characteristic.owner != nom) {
          _obj.characteristic = $p.utils.blank.guid;
          characteristic = this.characteristic;
        }
      }

      // проверим единицу измерения
      if(unit.owner != nom) {
        _obj.unit = nom.storage_unit.ref;
      }

      // если это следящая вставка, рассчитаем спецификацию
      if(!characteristic.origin.empty() && characteristic.origin.slave) {
        characteristic.specification.clear();
        characteristic.x = this.len;
        characteristic.y = this.width;
        characteristic.s = this.s || this.len * this.width / 1000000;
        const len_angl = new $p.DocCalc_order.FakeLenAngl({len: this.len, inset: characteristic.origin});
        const elm = new $p.DocCalc_order.FakeElm(this);
        characteristic.origin.calculate_spec({elm, len_angl, ox: characteristic});
        recalc = true;
      }

      // рассчитаем цены
      const fake_prm = {
        calc_order_row: this,
        spec: characteristic.specification
      };
      const {price} = _obj;
      $p.pricing.price_type(fake_prm);
      $p.pricing.calc_first_cost(fake_prm);
      $p.pricing.calc_amount(fake_prm);
      if(price && !_obj.price) {
        _obj.price = price;
        recalc = true;
      }
    }

    if($p.DocCalc_orderProductionRow.pfields.indexOf(field) != -1 || recalc) {

      if(!recalc) {
        _obj[field] = parseFloat(value);
      }

      isNaN(_obj.price) && (_obj.price = 0);
      isNaN(_obj.price_internal) && (_obj.price_internal = 0);
      isNaN(_obj.discount_percent) && (_obj.discount_percent = 0);
      isNaN(_obj.discount_percent_internal) && (_obj.discount_percent_internal = 0);

      _obj.amount = (_obj.price * ((100 - _obj.discount_percent) / 100) * _obj.quantity).round(rounding);

      // если есть внешняя цена дилера, получим текущую дилерскую наценку
      if(!no_extra_charge) {
        const prm = {calc_order_row: this};
        let extra_charge = $p.wsql.get_user_param('surcharge_internal', 'number');

        // если пересчет выполняется менеджером, используем наценку по умолчанию
        if(!$p.current_user.partners_uids.length || !extra_charge) {
          $p.pricing.price_type(prm);
          extra_charge = prm.price_type.extra_charge_external;
        }

        if(field != 'price_internal' && extra_charge && _obj.price) {
          _obj.price_internal = (_obj.price * (100 - _obj.discount_percent) / 100 * (100 + extra_charge) / 100).round(rounding);
        }
      }

      _obj.amount_internal = (_obj.price_internal * ((100 - _obj.discount_percent_internal) / 100) * _obj.quantity).round(rounding);

      // ставка и сумма НДС
      const doc = _owner._owner;
      if(doc.vat_consider) {
        const {НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС} = $p.enm.vat_rates;
        _obj.vat_rate = (nom.vat_rate.empty() ? НДС18 : nom.vat_rate).ref;
        switch (this.vat_rate) {
        case НДС18:
        case НДС18_118:
          _obj.vat_amount = (_obj.amount * 18 / 118).round(2);
          break;
        case НДС10:
        case НДС10_110:
          _obj.vat_amount = (_obj.amount * 10 / 110).round(2);
          break;
        case НДС20:
        case НДС20_120:
          _obj.vat_amount = (_obj.amount * 20 / 120).round(2);
          break;
        case НДС0:
        case БезНДС:
        case '_':
        case '':
          _obj.vat_amount = 0;
          break;
        }
        if(!doc.vat_included) {
          _obj.amount = (_obj.amount + _obj.vat_amount).round(2);
        }
      }
      else {
        _obj.vat_rate = '';
        _obj.vat_amount = 0;
      }

      const amount = _owner.aggregate([], ['amount', 'amount_internal']);
      amount.doc_amount = amount.amount.round(rounding);
      amount.amount_internal = amount.amount_internal.round(rounding);
      delete amount.amount;
      Object.assign(doc, amount);
      doc._manager.emit_async('update', doc, amount);

      // пересчитываем спецификации и цены в следящих вставках
      if(!_slave_recalc){
        _owner._owner._slave_recalc = true;
        _owner.forEach((row) => {
          if(row !== this && !row.characteristic.origin.empty() && row.characteristic.origin.slave) {
            row.value_change('quantity', 'update', row.quantity, no_extra_charge);
          }
        });
        _owner._owner._slave_recalc = false;
      }

      // TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

      return false;
    }
  }

};

$p.DocCalc_orderProductionRow.rfields = {
  nom: 's',
  characteristic: 's',
  quantity: 'n',
  len: 'n',
  width: 'n',
  s: 'n',
};

$p.DocCalc_orderProductionRow.pfields = 'price_internal,quantity,discount_percent_internal';

/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order_form_list
 */


$p.doc.calc_order.form_list = function(pwnd, attr, handlers){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: moment().subtract(2, 'month').toDate(),
			date_till: moment().add(1, 'month').toDate(),
			on_new: (o) => {
        handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
			},
			on_edit: (_mgr, rId) => {
        handlers.handleNavigate(`/${_mgr.class_name}/${rId}`);
			}
		};
	}

  return this.pouch_db.getIndexes()
    .then(({indexes}) => {
      attr._index = {
        ddoc: "mango_calc_order",
        fields: ["department", "state", "date", "search"],
        name: 'list',
        type: 'json',
      };
      if(!indexes.some(({ddoc}) => ddoc && ddoc.indexOf(attr._index.ddoc) != -1)){
        return this.pouch_db.createIndex(attr._index);
      }
    })
    .then(() => {
      return new Promise((resolve, reject) => {

        attr.on_create = (wnd) => {

          const {elmnts} = wnd;

          wnd.dep_listener = (obj, fields) => {
            if(obj == dp && fields.department){
              elmnts.filter.call_event();
              $p.wsql.set_user_param("current_department", dp.department.ref);
            }
          }

          // добавляем слушателя внешних событий
          if(handlers){
            const {custom_selection} = elmnts.filter;
            custom_selection._state = handlers.props.state_filter;
            handlers.onProps = (props) => {
              if(custom_selection._state != props.state_filter){
                custom_selection._state = props.state_filter;
                elmnts.filter.call_event();
              }
            }

            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          // добавляем отбор по подразделению
          const dp = $p.dp.builder_price.create();
          const pos = elmnts.toolbar.getPosition("input_filter");
          const txt_id = `txt_${dhx4.newId()}`;
          elmnts.toolbar.addText(txt_id, pos, "");
          const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
          const dep = new $p.iface.OCombo({
            parent: txt_div,
            obj: dp,
            field: "department",
            width: 180,
            hide_frm: true,
          });
          txt_div.style.border = "1px solid #ccc";
          txt_div.style.borderRadius = "3px";
          txt_div.style.padding = "3px 2px 1px 2px";
          txt_div.style.margin = "1px 5px 1px 1px";
          dep.DOMelem_input.placeholder = "Подразделение";

          dp._manager.on('update', wnd.dep_listener);

          const set_department = $p.DocCalc_order.set_department.bind(dp);
          set_department();
          if(!$p.wsql.get_user_param('couch_direct')){
            $p.md.once('user_log_in', set_department);
          }

          // настраиваем фильтр для списка заказов
          elmnts.filter.custom_selection.__define({
            department: {
              get: function () {
                const {department} = dp;
                return this._state == 'template' ? {$eq: $p.utils.blank.guid} : {$eq: department.ref};
                // const depts = [];
                // $p.cat.divisions.forEach((o) =>{
                //   if(o._hierarchy(department)){
                //     depts.push(o.ref)
                //   }
                // });
                // return depts.length == 1 ?  {$eq: depts[0]} : {$in: depts};
              },
              enumerable: true
            },
            state: {
              get: function(){
                return this._state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: this._state};
              },
              enumerable: true
            }
          });
          elmnts.filter.custom_selection._index = attr._index;

          // картинка заказа в статусбаре
          elmnts.status_bar = wnd.attachStatusBar();
          elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
            (ref, dbl) => {
              //dbl && $p.iface.set_hash("cat.characteristics", ref, "builder")
              dbl && handlers.handleNavigate(`/builder/${ref}`);
            });
          elmnts.grid.attachEvent("onRowSelect", (rid) => elmnts.svgs.reload(rid));

          wnd.attachEvent("onClose", (win) => {
            dep && dep.unload();
            return true;
          });

          attr.on_close = () => {
            elmnts.svgs && elmnts.svgs.unload();
            dep && dep.unload();
          }

          // wnd.close = (on_create) => {
          //
          //   if (wnd) {
          //     wnd.getAttachedToolbar().clearAll();
          //     wnd.detachToolbar();
          //     wnd.detachStatusBar();
          //     if (wnd.conf) {
          //       wnd.conf.unloading = true;
          //     }
          //     wnd.detachObject(true);
          //   }
          //   this.frm_unload(on_create);
          // }

          resolve(wnd);
        }

        return this.mango_selection(pwnd, attr);

      });
    });

};


/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order_form_obj
 */

(function ($p) {

  const _mgr = $p.doc.calc_order;
  let _meta_patched;

  _mgr.form_obj = function (pwnd, attr, handlers) {

    let o, wnd;

    /**
     * структура заголовков табчасти продукции
     * @param source
     */
    if(!_meta_patched) {
      (function (source, user) {
        // TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
        if($p.wsql.get_user_param('hide_price_dealer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0';
        }
        else if($p.wsql.get_user_param('hide_price_manufacturer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма';
          source.widths = '40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70';
        }
        else {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70';
        }

        if(user.role_available('СогласованиеРасчетовЗаказов') || user.role_available('РедактированиеЦен') || user.role_available('РедактированиеСкидок')) {
          source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro';
        }
        else {
          source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,calck,ro,calck,calck,ro';
        }

        _meta_patched = true;

      })($p.doc.calc_order.metadata().form.obj.tabular_sections.production, $p.current_user);
    }

    attr.draw_tabular_sections = (o, wnd, tabular_init) => {

      /**
       * получим задействованные в заказе объекты характеристик
       */
      const refs = [];
      o.production.each((row) => {
        if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new()) {
          refs.push(row._obj.characteristic);
        }
      });
      $p.cat.characteristics.adapter.load_array($p.cat.characteristics, refs)
        .then(() => {

          const footer = {
            columns: ",,,,#stat_total,,,#stat_s,,,,,#stat_total,,,#stat_total",
            _in_header_stat_s: function(tag,index,data){
              const calck=function(){
                let sum=0;
                o.production.each((row) => {
                  sum += row.s * row.quantity;
                });
                return sum.toFixed(2);
              }
              this._stat_in_header(tag,calck,index,data);
            }
          }

          // табчасть продукции со специфическим набором кнопок
          tabular_init('production', $p.injected_data['toolbar_calc_order_production.xml'], footer);
          const {production} = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent('onRowSelect', production_select);
          production.attachEvent('onEditCell', (stage,rId,cInd,nValue,oValue,fake) => {
            if(stage == 2 && fake !== true){
              if(production._edit_timer){
                clearTimeout(production._edit_timer);
              }
              production._edit_timer = setTimeout(() => {
                if(wnd && wnd.elmnts){
                  production.callEvent('onEditCell', [2, 0, 7, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 12, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 15, null, null, true]);
                }
              }, 300);
            }
          });

          let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
          toolbar.addSpacer('btn_delete');
          toolbar.attachEvent('onclick', toolbar_click);

          // табчасть планирования
          tabular_init('planning');
          toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
          toolbar.addButton('btn_fill_plan', 3, 'Заполнить');
          toolbar.attachEvent('onclick', toolbar_click);

          // в зависимости от статуса
          set_editable(o, wnd);

        });

      /**
       *  статусбар с картинками
       */
      wnd.elmnts.statusbar = wnd.attachStatusBar();
      wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
    };

    attr.draw_pg_header = (o, wnd) => {

      function layout_resize_finish() {
        setTimeout(() => {
          if(wnd.elmnts && wnd.elmnts.layout_header && wnd.elmnts.layout_header.setSizes) {
            wnd.elmnts.layout_header.setSizes();
            wnd.elmnts.pg_left.objBox.style.width = '100%';
            wnd.elmnts.pg_right.objBox.style.width = '100%';
          }
        }, 200);
      }

      /**
       *  закладка шапка
       */
      wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

      wnd.elmnts.layout_header.attachEvent('onResizeFinish', layout_resize_finish);

      wnd.elmnts.layout_header.attachEvent('onPanelResizeFinish', layout_resize_finish);

      /**
       *  левая колонка шапки документа
       */
      wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
      wnd.elmnts.cell_left.hideHeader();
      wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          ' ': [{id: 'number_doc', path: 'o.number_doc', synonym: 'Номер', type: 'ro', txt: o.number_doc},
            {id: 'date', path: 'o.date', synonym: 'Дата', type: 'ro', txt: moment(o.date).format(moment._masks.date_time)},
            'number_internal'
          ],
          'Контактная информация': ['partner', 'client_of_dealer', 'phone',
            {id: 'shipping_address', path: 'o.shipping_address', synonym: 'Адрес доставки', type: 'addr', txt: o['shipping_address']}
          ],
          'Дополнительные реквизиты': ['obj_delivery_state', 'category']
        }
      });

      /**
       *  правая колонка шапки документа
       * TODO: задействовать либо удалить choice_links
       * var choice_links = {contract: [
				 * {name: ["selection", "owner"], path: ["partner"]},
				 * {name: ["selection", "organization"], path: ["organization"]}
				 * ]};
       */

      wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
      wnd.elmnts.cell_right.hideHeader();
      wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          'Налоги': ['vat_consider', 'vat_included'],
          'Аналитика': ['project',
            {id: 'organization', path: 'o.organization', synonym: 'Организация', type: 'refc'},
            {id: 'contract', path: 'o.contract', synonym: 'Договор', type: 'refc'},
            {id: 'bank_account', path: 'o.bank_account', synonym: 'Счет организации', type: 'refc'},
            {id: 'department', path: 'o.department', synonym: 'Офис продаж', type: 'refc'},
            {id: 'warehouse', path: 'o.warehouse', synonym: 'Склад отгрузки', type: 'refc'},
          ],
          'Итоги': [{id: 'doc_currency', path: 'o.doc_currency', synonym: 'Валюта документа', type: 'ro', txt: o['doc_currency'].presentation},
            {id: 'doc_amount', path: 'o.doc_amount', synonym: 'Сумма', type: 'ron', txt: o['doc_amount']},
            {id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма внутр', type: 'ron', txt: o['amount_internal']}]
        }
      });

      /**
       *  редактор комментариев
       */
      wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
      wnd.elmnts.cell_note.hideHeader();
      wnd.elmnts.cell_note.setHeight(100);
      wnd.elmnts.cell_note.attachHTMLString('<textarea placeholder=\'Комментарий к заказу\' class=\'textarea_editor\'>' + o.note + '</textarea>');

    };

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_obj.xml'];

    attr.toolbar_click = toolbar_click;

    attr.on_close = frm_close;

    return this.constructor.prototype.form_obj.call(this, pwnd, attr)
      .then((res) => {
        if(res) {
          o = res.o;
          wnd = res.wnd;
          wnd.prompt = prompt;
          wnd.close_confirmed = true;
          if(handlers){
            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          rsvg_reload();
          o._manager.on('svgs', rsvg_reload);

          const search = $p.job_prm.parse_url_str(location.search);
          if(search.ref) {
            setTimeout(() => {
              wnd.elmnts.tabs.tab_production && wnd.elmnts.tabs.tab_production.setActive();
              rsvg_click(search.ref, 0);
            }, 200);
          };

          return res;
        }
      });

    /**
     * проверка, можно ли покидать страницу
     * @param loc
     * @return {*}
     */
    function prompt(loc) {
      if(loc.pathname.match(/builder/)) {
        return true;
      }
      return (o && o._modified) ? `${o.presentation} изменён.\n\nЗакрыть без сохранения?` : true;
    }

    function close() {
      if(o && o._obj) {
        const {ref, state} = o._obj;
        handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`);
      }
      else {
        handlers.handleNavigate(`/`);
      }
      $p.doc.calc_order.off('svgs', rsvg_reload);
    }

    /**
     * При активизации строки продукции
     * @param id
     * @param ind
     */
    function production_select(id, ind) {
      const row = o.production.get(id - 1);
      const {svgs, grids: {production}} = wnd.elmnts;
      wnd.elmnts.svgs.select(row.characteristic.ref);

      // если пользователь неполноправный, проверяем разрешение изменять цены номенклатуры
      if(production.columnIds[ind] === 'price') {
        const {current_user, CatParameters_keys, utils, enm: {comparison_types, parameters_keys_applying}} = $p;
        if(current_user.role_available('СогласованиеРасчетовЗаказов') || current_user.role_available('РедактированиеЦен')) {
          production.cells(id, ind).setDisabled(false);
        }
        else {
          const {nom} = row;
          let disabled = true;
          current_user.acl_objs.forEach(({acl_obj}) => {
            if(acl_obj instanceof CatParameters_keys && acl_obj.applying == parameters_keys_applying.Ценообразование) {
              acl_obj.params.forEach(({value, comparison_type}) => {
                if(utils.check_compare(nom, value, comparison_type, comparison_types)) {
                  return disabled = false;
                }
              });
              if(!disabled) {
                return disabled;
              }
            }
          });
          production.cells(id, ind).setDisabled(disabled);
        }
      }
    }

    /**
     * обработчик нажатия кнопок командных панелей
     */
    function toolbar_click(btn_id) {

      switch (btn_id) {

      case 'btn_sent':
        save('sent');
        break;

      case 'btn_save':
        save('save');
        break;

      case 'btn_save_close':
        save('close');
        break;

      case 'btn_retrieve':
        save('retrieve');
        break;

      case 'btn_post':
        save('post');
        break;

      case 'btn_unpost':
        save('unpost');
        break;

      case 'btn_fill_plan':
        o.fill_plan();
        break;

      case 'btn_close':
        close();
        break;

      case 'btn_add_builder':
        open_builder(true);
        break;

      case 'btn_clone':
        open_builder('clone');
        break;

      case 'btn_add_product':
        $p.dp.buyers_order.open_product_list(wnd, o);
        break;

      case 'btn_additions':
        $p.dp.buyers_order.open_additions(wnd, o, handlers);
        break;

      case 'btn_add_material':
        add_material();
        break;

      case 'btn_edit':
        open_builder();
        break;

      case 'btn_spec':
        open_spec();
        break;

      case 'btn_discount':
        show_discount();
        break;

      case 'btn_calendar':
        calendar_new_event();
        break;

      case 'btn_go_connection':
        go_connection();
        break;
      }

      if(btn_id.substr(0, 4) == 'prn_') {
        _mgr.print(o, btn_id, wnd);
      }
    }

    /**
     * создаёт событие календаря
     */
    function calendar_new_event() {
      $p.msg.show_not_implemented();
    }

    /**
     * показывает список связанных документов
     */
    function go_connection() {
      $p.msg.show_not_implemented();
    }

    /**
     * создаёт и показывает диалог групповых скидок
     */
    function show_discount() {

      if(!wnd.elmnts.discount) {
        wnd.elmnts.discount = $p.dp.buyers_order.create();
      }
      // перезаполняем
      refill_discount(wnd.elmnts.discount);

      const discount = $p.iface.dat_blank(null, {
        width: 300,
        height: 220,
        allow_close: true,
        allow_minmax: false,
        caption: 'Скидки по группам'
      });
      discount.setModal(true);

      discount.attachTabular({
        obj: wnd.elmnts.discount,
        ts: 'charges_discounts',
        reorder: false,
        disable_add_del: true,
        toolbar_struct: $p.injected_data['toolbar_discounts.xml'],
        ts_captions: {
          'fields': ['nom_kind', 'discount_percent'],
          'headers': 'Группа,Скидка',
          'widths': '*,80',
          'min_widths': '120,70',
          'aligns': '',
          'sortings': 'na,na',
          'types': 'ro,calck'
        },
      });
      const toolbar = discount.getAttachedToolbar();
      toolbar.attachEvent('onclick', (btn) => {
        wnd.elmnts.discount._mode = btn;
        refill_discount(wnd.elmnts.discount);
        toolbar.setItemText('bs', toolbar.getListOptionText('bs', btn));
      });
      if(wnd.elmnts.discount._disable_internal) {
        toolbar.disableListOption('bs', 'discount_percent');
      }
      toolbar.setItemText('bs', toolbar.getListOptionText('bs', wnd.elmnts.discount._mode));
    }

    function refill_discount(dp) {

      if(!dp._mode) {
        dp._disable_internal = !$p.current_user.role_available('РедактированиеСкидок');
        dp._mode = dp._disable_internal ? 'discount_percent_internal' : 'discount_percent';
        dp._calc_order = o;
      }

      const {charges_discounts} = dp;
      const groups = new Set();
      dp._data._loading = true;
      charges_discounts.clear();
      o.production.forEach((row) => {
        const group = {nom_kind: row.nom.nom_kind};
        if(!groups.has(group.nom_kind)) {
          groups.add(group.nom_kind);
          charges_discounts.add(group);
        }
        charges_discounts.find_rows(group, (sub) => {
          const percent = row[dp._mode];
          if(percent > sub.discount_percent) {
            sub.discount_percent = percent;
          }
        });
      });
      dp._data._loading = false;
      dp._manager.emit_async('rows', dp, {'charges_discounts': true});
    }


    /**
     * вспомогательные функции
     */

    function production_get_sel_index() {
      var selId = wnd.elmnts.grids.production.getSelectedRowId();
      if(selId && !isNaN(Number(selId))) {
        return Number(selId) - 1;
      }

      $p.msg.show_msg({
        type: 'alert-warning',
        text: $p.msg.no_selected_row.replace('%1', 'Продукция'),
        title: o.presentation
      });
    }

    function save(action) {

      function do_save(post) {

        if(!wnd.elmnts.ro) {
          o.note = wnd.elmnts.cell_note.cell.querySelector('textarea').value.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '').replace(/&.{2,6};/g, '');
          wnd.elmnts.pg_left.selectRow(0);
        }

        o.save(post)
          .then(function () {
            if(action == 'sent' || action == 'close') {
              close();
            }
            else {
              wnd.set_text();
              set_editable(o, wnd);
            }

          })
          .catch($p.record_log);
      }

      switch (action) {
      case 'sent':
        // показать диалог и обработать возврат
        dhtmlx.confirm({
          title: $p.msg.order_sent_title,
          text: $p.msg.order_sent_message,
          cancel: $p.msg.cancel,
          callback: function (btn) {
            if(btn) {
              // установить транспорт в "отправлено" и записать
              o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
              do_save();
            }
          }
        });
        break;

      case 'retrieve':
        // установить транспорт в "отозвано" и записать
        o.obj_delivery_state = $p.enm.obj_delivery_states.Отозван;
        do_save();
        break;

      case 'post':
        do_save(true);
        break;

      case 'unpost':
        do_save(false);
        break;

      default:
        do_save();
      }
    }

    function frm_close() {

      if(o && o._modified) {
        if(o.is_new()) {
          o.unload();
        }
        else if(!location.pathname.match(/builder/)) {
          setTimeout(o.load.bind(o), 100);
        }
      }

      // выгружаем из памяти всплывающие окна скидки и связанных файлов
      ['vault', 'vault_pop', 'discount', 'svgs', 'layout_header'].forEach((elm) => {
        wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
      });

      return true;
    }

    // устанавливает видимость и доступность
    function set_editable(o, wnd) {

      const {pg_left, pg_right, frm_toolbar, grids, tabs} = wnd.elmnts;

      pg_right.cells('vat_consider', 1).setDisabled(true);
      pg_right.cells('vat_included', 1).setDisabled(true);

      const ro = wnd.elmnts.ro = o.is_read_only;

      const retrieve_enabed = !o._deleted &&
        (o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

      grids.production.setEditable(!ro);
      grids.planning.setEditable(!ro);
      pg_left.setEditable(!ro);
      pg_right.setEditable(!ro);

      // гасим кнопки проведения, если недоступна роль
      if(!$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
        frm_toolbar.hideItem('btn_post');
        frm_toolbar.hideItem('btn_unpost');
      }

      // если не технологи и не менеджер - запрещаем менять статусы
      if(!$p.current_user.role_available('ИзменениеТехнологическойНСИ') && !$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
        pg_left.cells('obj_delivery_state', 1).setDisabled(true);
      }

      // кнопки записи и отправки гасим в зависимости от статуса
      if(ro) {
        frm_toolbar.disableItem('btn_sent');
        frm_toolbar.disableItem('btn_save');
        let toolbar;
        const disable = (itemId) => toolbar.disableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(disable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(disable);
      }
      else {
        // шаблоны никогда не надо отправлять
        if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон) {
          frm_toolbar.disableItem('btn_sent');
        }
        else {
          frm_toolbar.enableItem('btn_sent');
        }
        frm_toolbar.enableItem('btn_save');
        let toolbar;
        const enable = (itemId) => toolbar.enableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(enable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(enable);
      }
      if(retrieve_enabed) {
        frm_toolbar.enableListOption('bs_more', 'btn_retrieve');
      }
      else {
        frm_toolbar.disableListOption('bs_more', 'btn_retrieve');
      }
    }

    /**
     * показывает диалог с сообщением "это не продукция"
     */
    function not_production() {
      $p.msg.show_msg({
        title: $p.msg.bld_title,
        type: 'alert-error',
        text: $p.msg.bld_not_product
      });
    }

    /**
     * ОткрытьПостроитель()
     * @param [create_new] {Boolean} - создавать новое изделие или открывать в текущей строке
     */
    function open_builder(create_new) {
      var selId;

      if(create_new == 'clone') {
        const selId = production_get_sel_index();
        if(selId == undefined) {
          not_production();
        }
        else {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count()) {
              // добавляем строку
              o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
                .then(({characteristic}) => {
                  // заполняем продукцию копией данных текущей строки
                  characteristic._mixin(row.characteristic._obj, null,
                    ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'note', 'partner'], true);
                  handlers.handleNavigate(`/builder/${characteristic.ref}`);
                });
            }
            else {
              not_production();
            }
          }
        }

      }
      else if(create_new) {
        o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
          .then((row) => {
            handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
          });
      }
      else {
        const selId = production_get_sel_index();
        if(selId != undefined) {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count() == 0) {
              // возможно, это заготовка - проверим номенклатуру системы
              if(row.characteristic.leading_product.calc_order == calc_order) {
                //$p.iface.set_hash("cat.characteristics", row.characteristic.leading_product.ref, "builder");
                handlers.handleNavigate(`/builder/${row.characteristic.leading_product.ref}`);
              }
            }
            else {
              //$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
              handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
            }
          }
        }
      }

    }

    /**
     * Открывает форму спецификации текущей строки
     */
    function open_spec() {
      const selId = production_get_sel_index();
      if(selId != undefined) {
        const row = o.production.get(selId);
        row && !row.characteristic.empty() && row.characteristic.form_obj().then((w) => w.wnd.maximize());
      }
    }

    function rsvg_reload() {
      o && wnd && wnd.elmnts && wnd.elmnts.svgs && wnd.elmnts.svgs.reload(o);
    }

    function rsvg_click(ref, dbl) {
      const {production} = wnd.elmnts.grids;
      production && o.production.find_rows({characteristic: ref}, (row) => {
        production.selectRow(row.row - 1, dbl === 0);
        dbl && open_builder();
        return false;
      });
    }

    /**
     * добавляет строку материала
     */
    function add_material() {
      const {production} = wnd.elmnts.grids;
      const row = o.create_product_row({grid: production}).row - 1;
      setTimeout(() => {
        production.selectRow(row);
        production.selectCell(row, production.getColIndexById('nom'), false, true, true);
        production.cells().open_selection();
      });
    }

  };

})($p);

/**
 * форма выбора документов Расчет-заказ. публикуемый метод: doc.calc_order.form_selection(pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order_form_selection
 */


$p.doc.calc_order.form_selection = function(pwnd, attr){

	const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

	// настраиваем фильтр для списка заказов
	wnd.elmnts.filter.custom_selection._view = { get value() { return '' } };
	wnd.elmnts.filter.custom_selection._key = { get value() { return '' } };

	// картинка заказа в статусбаре
	wnd.do_not_maximize = true;
	wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.status_bar,
    (ref, dbl) => {
	  if(dbl){
      wnd && wnd.close();
      return pwnd.on_select && pwnd.on_select({_block: ref});
    }
    });
	wnd.elmnts.grid.attachEvent("onRowSelect", (rid) => wnd.elmnts.svgs.reload(rid));


	setTimeout(() => {
		wnd.setDimension(900, 580);
		wnd.centerOnScreen();
	})

	return wnd;
};


/**
 * ### Отчеты по документу Расчет
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 23.06.2016
 *
 * @module doc_calc_order_reports
 *
 */

$p.doc.calc_order.__define({

	rep_invoice_execution: {
		value: function (rep) {

			var query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 3
				},
				res = {
					data: [],
					readOnly: true,
					colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
					colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
					columns: [
						{type: 'text'},
						{type: 'text'},
						{type: 'text'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'}
					],
					wordWrap: false
					//minSpareRows: 1
				};

			if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов")){
				//query_options.group_level = 3;
				query_options.startkey = [$p.current_user.partners_uids[0],""];
				query_options.endkey = [$p.current_user.partners_uids[0],"\ufff0"];
			}

			return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options)

				.then(function (data) {

					var total = {
						invoice: 0,
						pay: 0,
						total_pay: 0,
						shipment:0,
						total_shipment:0
					};

					if(data.rows){

						data.rows.forEach(function (row) {

							if(!row.value.total_pay && !row.value.total_shipment)
								return;

							res.data.push([
								$p.cat.partners.get(row.key[0]).presentation,
								$p.cat.organizations.get(row.key[1]).presentation,
								row.key[2],
								row.value.invoice,
								row.value.pay,
								row.value.total_pay,
								row.value.shipment,
								row.value.total_shipment]);

							total.invoice+= row.value.invoice;
							total.pay+=row.value.pay;
							total.total_pay+=row.value.total_pay;
							total.shipment+=row.value.shipment;
							total.total_shipment+=row.value.total_shipment;
						});

						res.data.push([
							"Итого:",
							"",
							"",
							total.invoice,
							total.pay,
							total.total_pay,
							total.shipment,
							total.total_shipment]);

						res.mergeCells= [
							{row: res.data.length-1, col: 0, rowspan: 1, colspan: 3}
						]
					}

					rep.requery(res);

					return res;
				});
		}
	},

	rep_planing: {
		value: function (rep, attr) {

			var date_from = $p.utils.date_add_day(new Date(), -1, true),
				date_till = $p.utils.date_add_day(date_from, 7, true),
				query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 5,
					startkey: [date_from.getFullYear(), date_from.getMonth()+1, date_from.getDate(), ""],
					endkey: [date_till.getFullYear(), date_till.getMonth()+1, date_till.getDate(),"\ufff0"]
				},
				res = {
					data: [],
					readOnly: true,
					wordWrap: false
					//minSpareRows: 1
				};



			return $p.wsql.pouch.remote.doc.query("server/planning", query_options)

				.then(function (data) {


					if(data.rows){

						var include_detales = $p.current_user.role_available("СогласованиеРасчетовЗаказов");

						data.rows.forEach(function (row) {

							if(!include_detales){

							}

							res.data.push([
								new Date(row.key[0], row.key[1]-1, row.key[2]),
								$p.cat.parameters_keys.get(row.key[3]),
								row.value.debit,
								row.value.credit,
								row.value.total
							]);
						});

					}

					rep.requery(res);

					return res;
				});

		}
	}

});

/**
 * ### Модуль менеджера и документа _Оплата платежной картой_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_credit_card_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocCredit_card_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};

/**
 * ### Модуль менеджера и документа _Платежное поручение входящее_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_debit_bank_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocDebit_bank_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};

/**
 * ### Модуль менеджера и документа _Приходный кассовый ордер_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_debit_cash_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocDebit_cash_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};

/**
 * ### Модуль менеджера и документа Установка цен номенклатуры
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_nom_prices_setup
 * Created 28.07.2016
 */


// Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

/**
 * Обработчик при создании документа
 */
$p.DocNom_prices_setup.prototype.after_create = function () {
  //Номер документа
  return this.new_number_doc();
};

// установим валюту и тип цен по умолчению при добавлении строки
$p.DocNom_prices_setup.prototype.add_row = function (row) {
  if (row._owner.name === 'goods') {
    const {price_type} = row._owner._owner;
    row.price_type = price_type;
    row.currency = price_type.price_currency;
  }
};

// перед записью проверяем уникальность ключа
$p.DocNom_prices_setup.prototype.before_save = function () {
  let aggr = this.goods.aggregate(['nom', 'nom_characteristic', 'price_type'], ['price'], 'COUNT', true),
    err;
  if (aggr.some((row) => {
      if (row.price > 1) {
        err = row;
        return row.price > 1;
      }
    })) {
    $p.msg.show_msg({
      type: 'alert-warning',
      text: '<table style=\'text-align: left; width: 100%;\'><tr><td>Номенклатура</td><td>' + $p.cat.nom.get(err.nom).presentation + '</td></tr>' +
      '<tr><td>Характеристика</td><td>' + $p.cat.characteristics.get(err.nom_characteristic).presentation + '</td></tr>' +
      '<tr><td>Тип цен</td><td>' + $p.cat.nom_prices_types.get(err.price_type).presentation + '</td></tr></table>',
      title: 'Дубли строк',
    });

    return false;
  }
};

// Подписываемся на глобальное событие tabular_paste
$p.on('tabular_paste', (clip) => {

  if (clip.grid && clip.obj && clip.obj._manager == $p.doc.nom_prices_setup) {

    var rows = [];

    clip.data.split('\n').map(function (row) {
      return row.split('\t');
    }).forEach(function (row) {

      if (row.length != 3)
        return;

      var nom = $p.cat.nom.by_name(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.by_id(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.find({article: row[0]});
      if (!nom || nom.empty())
        return;

      var characteristic = '';
      if (row[1]) {
        characteristic = $p.cat.characteristics.find({owner: nom, name: row[1]});
        if (!characteristic || characteristic.empty())
          characteristic = $p.cat.characteristics.find({owner: nom, name: {like: row[1]}});
      }

      rows.push({
        nom: nom,
        nom_characteristic: characteristic,
        price: parseFloat(row[2].replace(',', '.')),
        price_type: clip.obj.price_type,
      });
    });

    if (rows.length) {

      clip.grid.editStop();

      var first = clip.obj.goods.get(parseInt(clip.grid.getSelectedRowId()) - 1);

      rows.forEach(function (row) {
        if (first) {
          first._mixin(row);
          first = null;
        } else
          clip.obj.goods.add(row);
      });

      clip.obj.goods.sync_grid(clip.grid);

      clip.e.preventDefault();
      return $p.iface.cancel_bubble(e);
    }
  }

});

/**
 * ### Модуль менеджера и документа _Реализация товаров и услуг_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_selling
 *
 * Created 10.10.2016
 */


// перед записью рассчитываем итоги
$p.DocSelling.prototype.before_save = function () {
  this.doc_amount = this.goods.aggregate([], 'amount') + this.services.aggregate([], 'amount');
};



/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 * @module  glob_pricing
 */

/**
 * ### Ценообразование
 *
 * @class Pricing
 * @param $p {MetaEngine} - контекст
 * @static
 */
class Pricing {

  constructor($p) {

    // подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
    $p.md.once("predefined_elmnts_inited", () => {

      // грузим в ram цены номенклатуры
      this.by_range()
        .then(() => {
          // излучаем событие "можно открывать формы"
          $p.adapters.pouch.emit('pouch_complete_loaded');
          // следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
          $p.doc.nom_prices_setup.pouch_db.changes({
            since: 'now',
            live: true,
            include_docs: true,
            selector: {class_name: {$in: ['doc.nom_prices_setup', 'cat.formulas']}}
          }).on('change', (change) => {
            // формируем новый
            if(change.doc.class_name == 'doc.nom_prices_setup'){
              setTimeout(() => {
                this.by_doc(change.doc)
              }, 1000);
            }
          });
        })
    });

  }

  build_cache(rows) {
    const {nom, currencies} = $p.cat;
    const note = 'Индекс цен номенклатуры';
    for(const {key, value} of rows){
      if(!Array.isArray(value)){
        return setTimeout(() => $p.iface.do_reload('', note), 1000);
      }
      const onom = nom.get(key[0], false, true);
      if (!onom || !onom._data){
        $p.record_log({
          class: 'error',
          nom: key[0],
          note,
          value
        });
        continue;
      }
      if (!onom._data._price){
        onom._data._price = {};
      }
      const {_price} = onom._data;

      if (!_price[key[1]]){
        _price[key[1]] = {};
      }
      _price[key[1]][key[2]] = value.map((v) => ({
        date: new Date(v.date),
        currency: currencies.get(v.currency),
        price: v.price
      }));
    }
  }

  /**
   * Перестраивает кеш цен номенклатуры по длинному ключу
   * @param startkey
   * @return {Promise.<TResult>|*}
   */
  by_range(startkey, step = 0) {

    return $p.doc.nom_prices_setup.pouch_db.query('doc/doc_nom_prices_setup_slice_last',
      {
        limit: 600,
        include_docs: false,
        startkey: startkey || [''],
        endkey: ['\ufff0'],
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
        step++;
        $p.adapters.pouch.emit('nom_prices', step);
        if (res.rows.length === 600) {
          return this.by_range(res.rows[res.rows.length - 1].key, step);
        }
      });
  }

  /**
   * Перестраивает кеш цен номенклатуры по массиву ключей
   * @param startkey
   * @return {Promise.<TResult>|*}
   */
  by_doc(doc) {
    const keys = doc.goods.map(({nom, nom_characteristic, price_type}) => [nom, nom_characteristic, price_type]);
    return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
      {
        include_docs: false,
        keys: keys,
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
      });
  }

  /**
   * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
   * Если в маржинальных коэффициентах или номенклатуре указана формула - выполняет
   *
   * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
   * @method nom_price
   * @param nom
   * @param characteristic
   * @param price_type
   * @param prm
   * @param row
   */
  nom_price(nom, characteristic, price_type, prm, row) {

    if (row && prm) {
      // _owner = calc_order
      const {_owner} = prm.calc_order_row._owner,
        price_prm = {
          price_type: price_type,
          characteristic: characteristic,
          date: _owner.date,
          currency: _owner.doc_currency
        };

      if (price_type == prm.price_type.price_type_first_cost && !prm.price_type.formula.empty()) {
        price_prm.formula = prm.price_type.formula;
      }
      else if(price_type == prm.price_type.price_type_sale && !prm.price_type.sale_formula.empty()){
        price_prm.formula = prm.price_type.sale_formula;
      }
      if(!characteristic.clr.empty()){
        price_prm.clr = characteristic.clr;
      }
      row.price = nom._price(price_prm);

      return row.price;
    }
  }

  /**
   * Возвращает структуру типов цен и КМарж
   * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
   * @method price_type
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  price_type(prm) {

    // Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
    // 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
    // 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
    const {utils, job_prm, enm, ireg, cat} = $p;
    const empty_formula = cat.formulas.get();

    prm.price_type = {
      marginality: 1.9,
      marginality_min: 1.2,
      marginality_internal: 1.5,
      discount: 0,
      discount_external: 10,
      extra_charge_external: 0,
      price_type_first_cost: job_prm.pricing.price_type_first_cost,
      price_type_sale: job_prm.pricing.price_type_sale,
      price_type_internal: job_prm.pricing.price_type_first_cost,
      formula: empty_formula,
      sale_formula: empty_formula,
      internal_formula: empty_formula,
      external_formula: empty_formula
    };

    const {calc_order_row} = prm;
    const {nom, characteristic} = calc_order_row;
    const {partner} = calc_order_row._owner._owner;
    const filter = nom.price_group.empty() ?
        {price_group: nom.price_group} :
        {price_group: {in: [nom.price_group, cat.price_groups.get()]}};
    const ares = [];


    ireg.margin_coefficients.find_rows(filter, (row) => {

      // фильтруем по параметрам
      let ok = true;
      if(!row.key.empty()){
        row.key.params.forEach((row_prm) => {

          const {property} = row_prm;
          // для вычисляемых параметров выполняем формулу
          if(property.is_calculated){
            ok = utils.check_compare(property.calculated_value({calc_order_row}), property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
          }
          // заглушка для совместимости с УПзП
          else if(property.empty()){
            const vpartner = cat.partners.get(row_prm._obj.value, false, true);
            if(vpartner && !vpartner.empty()){
              ok = vpartner == partner;
            }
          }
          // обычные параметры ищем в параметрах изделия
          else{
            let finded;
            characteristic.params.find_rows({
              cnstr: 0,
              param: property
            }, (row_x) => {
              finded = row_x;
              return false;
            });
            if(finded){
              ok = utils.check_compare(finded.value, property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
            }
            else{
              ok = false;
            }
          }
          if(!ok){
            return false;
          }
        })
      }
      if(ok){
        ares.push(row);
      }
    });

    // сортируем по приоритету и ценовой группе
    if(ares.length){
      ares.sort((a, b) => {

        if ((!a.key.empty() && b.key.empty()) || (a.key.priority > b.key.priority)) {
          return -1;
        }
        if ((a.key.empty() && !b.key.empty()) || (a.key.priority < b.key.priority)) {
          return 1;
        }

        if (a.price_group.ref > b.price_group.ref) {
          return -1;
        }
        if (a.price_group.ref < b.price_group.ref) {
          return 1;
        }

        return 0;
      });
      Object.keys(prm.price_type).forEach((key) => {
        prm.price_type[key] = ares[0][key];
      });
    }

    // если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
    partner.extra_fields.find_rows({
      property: job_prm.pricing.dealer_surcharge
    }, (row) => {
      const val = parseFloat(row.value);
      if(val){
        prm.price_type.extra_charge_external = val;
      }
      return false;
    });

    return prm.price_type;
  }

  /**
   * Рассчитывает плановую себестоимость строки документа Расчет
   * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
   *
   * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  calc_first_cost(prm) {

    const {marginality_in_spec} = $p.job_prm.pricing;
    const fake_row = {};

    if(!prm.spec)
      return;

    // пытаемся рассчитать по спецификации
    if(prm.spec.count()){
      prm.spec.forEach((row) => {

        const {_obj, nom, characteristic} = row;

        this.nom_price(nom, characteristic, prm.price_type.price_type_first_cost, prm, _obj);
        _obj.amount = _obj.price * _obj.totqty1;

        if(marginality_in_spec){
          fake_row.nom = nom;
          const tmp_price = this.nom_price(nom, characteristic, prm.price_type.price_type_sale, prm, fake_row);
          _obj.amount_marged = (tmp_price ? tmp_price : _obj.price) * _obj.totqty1;
        }

      });
      prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
    }
    else{
      // расчет себестомиости по номенклатуре строки расчета
      fake_row.nom = prm.calc_order_row.nom;
      fake_row.characteristic = prm.calc_order_row.characteristic;
      prm.calc_order_row.first_cost = this.nom_price(fake_row.nom, fake_row.characteristic, prm.price_type.price_type_first_cost, prm, fake_row);
    }

    // себестоимость вытянутых строк спецификации в заказ
    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_first_cost(fake_prm);
    });
  }

  /**
   * Рассчитывает стоимость продажи в строке документа Расчет
   *
   * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  calc_amount (prm) {

    const {calc_order_row, price_type} = prm;
    const price_cost = $p.job_prm.pricing.marginality_in_spec && prm.spec.count() ?
      prm.spec.aggregate([], ["amount_marged"]) :
      this.nom_price(calc_order_row.nom, calc_order_row.characteristic, price_type.price_type_sale, prm, {});

    let extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");

    // если пересчет выполняется менеджером, используем наценку по умолчанию
    if(!$p.current_user.partners_uids.length || !extra_charge){
      extra_charge = price_type.extra_charge_external;
    }

    // цена продажи
    if(price_cost){
      calc_order_row.price = price_cost.round(2);
    }
    else{
      calc_order_row.price = (calc_order_row.first_cost * price_type.marginality).round(2);
    }

    // КМарж в строке расчета
    calc_order_row.marginality = calc_order_row.first_cost ?
      calc_order_row.price * ((100 - calc_order_row.discount_percent)/100) / calc_order_row.first_cost : 0;


    // TODO: Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
    if(extra_charge){
      calc_order_row.price_internal = (calc_order_row.price *
      (100 - calc_order_row.discount_percent)/100 * (100 + extra_charge)/100).round(2);

      // TODO: учесть формулу
    }

    // Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
    !prm.hand_start && calc_order_row.value_change("price", {}, calc_order_row.price, true);

    // Цены и суммы вытянутых строк спецификации в заказ
    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_amount(fake_prm);
    });

  }

  /**
   * Пересчитывает сумму из валюты в валюту
   * @param amount {Number} - сумма к пересчету
   * @param date {Date} - дата курса
   * @param from - исходная валюта
   * @param [to] - конечная валюта
   * @return {Number}
   */
  from_currency_to_currency (amount, date, from, to) {

    const {main_currency} = $p.job_prm.pricing;

    if(!to || to.empty()){
      to = main_currency;
    }
    if(!from || from.empty()){
      from = main_currency;
    }
    if(from == to){
      return amount;
    }
    if(!date){
      date = new Date();
    }
    if(!this.cource_sql){
      this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `period` desc");
    }

    let cfrom = {course: 1, multiplicity: 1},
      cto = {course: 1, multiplicity: 1};
    if(from != main_currency){
      const tmp = this.cource_sql([from.ref, date]);
      if(tmp.length)
        cfrom = tmp[0];
    }
    if(to != main_currency){
      const tmp = this.cource_sql([to.ref, date]);
      if(tmp.length)
        cto = tmp[0];
    }

    return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
  }

  /**
   * Выгружает в CouchDB изменённые в RAM справочники
   */
  cut_upload () {

    if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов") && !$p.current_user.role_available("ИзменениеТехнологическойНСИ")){
      $p.msg.show_msg({
        type: "alert-error",
        text: $p.msg.error_low_acl,
        title: $p.msg.error_rights
      });
      return true;
    }

    function upload_acc() {
      const mgrs = [
        "cat.users",
        "cat.individuals",
        "cat.organizations",
        "cat.partners",
        "cat.contracts",
        "cat.currencies",
        "cat.nom_prices_types",
        "cat.price_groups",
        "cat.cashboxes",
        "cat.partner_bank_accounts",
        "cat.organization_bank_accounts",
        "cat.projects",
        "cat.stores",
        "cat.cash_flow_articles",
        "cat.cost_items",
        "cat.price_groups",
        "cat.delivery_areas",
        "ireg.currency_courses",
        "ireg.margin_coefficients"
      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {
          //handle change

        })
        .on('paused', (err) => {
          // replication paused (e.g. replication up to date, user went offline)

        })
        .on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        })
        .on('denied', (err) => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {

          if($p.current_user.role_available("ИзменениеТехнологическойНСИ"))
            upload_tech();

          else
            $p.msg.show_msg({
              type: "alert-info",
              text: $p.msg.sync_complite,
              title: $p.msg.sync_title
            });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    function upload_tech() {
      const mgrs = [
        "cat.units",
        "cat.nom",
        "cat.nom_groups",
        "cat.nom_units",
        "cat.nom_kinds",
        "cat.elm_visualization",
        "cat.destinations",
        "cat.property_values",
        "cat.property_values_hierarchy",
        "cat.inserts",
        "cat.insert_bind",
        "cat.color_price_groups",
        "cat.clrs",
        "cat.furns",
        "cat.cnns",
        "cat.production_params",
        "cat.parameters_keys",
        "cat.formulas",
        "cch.properties",
        "cch.predefined_elmnts"

      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {
          //handle change

        })
        .on('paused', (err) => {
          // replication paused (e.g. replication up to date, user went offline)

        })
        .on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        })
        .on('denied', (err) => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {
          $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    if($p.current_user.role_available("СогласованиеРасчетовЗаказов"))
      upload_acc();
    else
      upload_tech();

  }

}


/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__ в контексте MetaEngine
 *
 * @property pricing
 * @type Pricing
 */
$p.pricing = new Pricing($p);

/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  glob_products_building
 * Created 26.05.2015
 */

class ProductsBuilding {

  constructor(listen) {

    let added_cnn_spec,
      ox,
      spec,
      constructions,
      coordinates,
      cnn_elmnts,
      glass_specification,
      params;


    /**
     * СтрокаСоединений
     * @param elm1
     * @param elm2
     * @return {Number|DataObj}
     */
    function cnn_row(elm1, elm2) {
      let res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
      if(res.length) {
        return res[0].row;
      }
      res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
      if(res.length) {
        return res[0].row;
      }
      return 0;
    }

    /**
     * НадоДобавитьСпецификациюСоединения
     * @param cnn
     * @param elm1
     * @param elm2
     */
    function cnn_need_add_spec(cnn, elm1, elm2, point) {
      // соединения крест в стык обрабатываем по координатам, остальные - по паре элементов
      if(cnn && cnn.cnn_type == $p.enm.cnn_types.xx) {
        if(!added_cnn_spec.points) {
          added_cnn_spec.points = [];
        }
        for (let p of added_cnn_spec.points) {
          if(p.is_nearest(point, true)) {
            return false;
          }
        }
        added_cnn_spec.points.push(point);
        return true;
      }
      else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1) {
        return false;
      }
      added_cnn_spec[elm1] = elm2;
      return true;
    }


    /**
     * ДополнитьСпецификациюСпецификациейСоединения
     * @method cnn_add_spec
     * @param cnn {_cat.Cnns}
     * @param elm {BuilderElement}
     * @param len_angl {Object}
     */
    function cnn_add_spec(cnn, elm, len_angl, cnn_other) {
      if(!cnn) {
        return;
      }
      const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      cnn_filter_spec(cnn, elm, len_angl).forEach((row_cnn_spec) => {

        const {nom} = row_cnn_spec;

        // TODO: nom может быть вставкой - в этом случае надо разузловать
        if(nom instanceof $p.CatInserts) {
          if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)) {
            const tmp_len_angl = len_angl._clone();
            tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
            nom.calculate_spec({elm, len_angl: tmp_len_angl, ox});
          }
          else {
            nom.calculate_spec({elm, len_angl, ox});
          }
        }
        else {

          const row_spec = new_spec_row({row_base: row_cnn_spec, origin: len_angl.origin || cnn, elm, nom, spec, ox});

          // рассчитаем количество
          if(nom.is_pieces) {
            if(!row_cnn_spec.coefficient) {
              row_spec.qty = row_cnn_spec.quantity;
            }
            else {
              row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
                .round(nom.rounding_quantity);
            }
          }
          else {
            row_spec.qty = row_cnn_spec.quantity;

            // если указано cnn_other, берём не размер соединения, а размеры предыдущего и последующего
            if(row_cnn_spec.sz || row_cnn_spec.coefficient) {
              let sz = row_cnn_spec.sz, finded, qty;
              if(cnn_other) {
                cnn_other.specification.find_rows({nom}, (row) => {
                  sz += row.sz;
                  qty = row.quantity;
                  return !(finded = true);
                });
              }
              if(!finded) {
                sz *= 2;
              }
              if(!row_spec.qty && finded && len_angl.art1) {
                row_spec.qty = qty;
              }
              row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
            }
          }

          // если указана формула - выполняем
          if(!row_cnn_spec.formula.empty()) {
            const qty = row_cnn_spec.formula.execute({
              ox,
              elm,
              len_angl,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_spec,
              row_spec: row_spec
            });
            // если формула является формулой условия, используем результат, как фильтр
            if(row_cnn_spec.formula.condition_formula && !qty){
              row_spec.qty = 0;
            }
          }
          calc_count_area_mass(row_spec, spec, len_angl, row_cnn_spec.angle_calc_method);
        }

      });
    }

    /**
     * ПолучитьСпецификациюСоединенияСФильтром
     * @param cnn
     * @param elm
     * @param len_angl
     */
    function cnn_filter_spec(cnn, elm, len_angl) {

      const res = [];
      const {angle_hor} = elm;
      const {art1, art2} = $p.job_prm.nom;
      const {САртикулом1, САртикулом2} = $p.enm.specification_installation_methods;
      const {check_params} = ProductsBuilding;

      const {cnn_type, specification, selection_params} = cnn;
      const {ii, xx, acn} = $p.enm.cnn_types;

      specification.each((row) => {
        const {nom} = row;
        if(!nom || nom.empty() || nom == art1 || nom == art2) {
          return;
        }

        // только для прямых или только для кривых профилей
        if((row.for_direct_profile_only > 0 && !elm.is_linear()) ||
          (row.for_direct_profile_only < 0 && elm.is_linear())) {
          return;
        }

        //TODO: реализовать фильтрацию
        if(cnn_type == ii) {
          if(row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len) {
            return;
          }
        }
        else {
          if(row.amin > len_angl.angle || row.amax < len_angl.angle) {
            return;
          }
        }

        // "устанавливать с" проверяем только для соединений профиля
        if((row.set_specification == САртикулом1 && len_angl.art2) || (row.set_specification == САртикулом2 && len_angl.art1)) {
          return;
        }
        // для угловых, разрешаем art2 только явно для art2
        if(len_angl.art2 && acn.a.indexOf(cnn_type) != -1 && row.set_specification != САртикулом2 && cnn_type != xx) {
          return;
        }

        // проверяем параметры изделия и добавляем, если проходит по ограничениям
        if(check_params({params: selection_params, row_spec: row, elm, ox})) {
          res.push(row);
        }

      });

      return res;
    }


    /**
     * Спецификации фурнитуры
     * @param contour {Contour}
     */
    function furn_spec(contour) {

      // у рамных контуров фурнитуры не бывает
      if(!contour.parent) {
        return false;
      }

      // кеш сторон фурнитуры
      const {furn_cache, furn} = contour;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      // проверяем, подходит ли фурнитура под геометрию контура
      if(!furn_check_opening_restrictions(contour, furn_cache)) {
        return;
      }

      // уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
      contour.update_handle_height(furn_cache);

      // получаем спецификацию фурнитуры и переносим её в спецификацию изделия
      const blank_clr = $p.cat.clrs.get();
      furn.furn_set.get_spec(contour, furn_cache).each((row) => {
        const elm = {elm: -contour.cnstr, clr: blank_clr};
        const row_spec = new_spec_row({elm, row_base: row, origin: row.origin, spec, ox});

        if(row.is_procedure_row) {
          row_spec.elm = row.handle_height_min;
          row_spec.len = row.coefficient / 1000;
          row_spec.qty = 0;
          row_spec.totqty = 1;
          row_spec.totqty1 = 1;
        }
        else {
          row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
          calc_count_area_mass(row_spec, spec);
        }
      });
    }

    /**
     * Проверяет ограничения открывания, добавляет визуализацию ошибок
     * @param contour {Contour}
     * @param cache {Object}
     * @return {boolean}
     */
    function furn_check_opening_restrictions(contour, cache) {

      let ok = true;
      const {new_spec_row} = ProductsBuilding;

      // TODO: реализовать проверку по количеству сторон

      // проверка геометрии
      contour.furn.open_tunes.each((row) => {
        const elm = contour.profile_by_furn_side(row.side, cache);
        const len = elm._row.len - 2 * elm.nom.sizefurn;

        // angle_hor = elm.angle_hor; TODO: реализовать проверку углов

        if(len < row.lmin || len > row.lmax || (!elm.is_linear() && !row.arc_available)) {
          new_spec_row({elm, row_base: {clr: $p.cat.clrs.get(), nom: $p.job_prm.nom.furn_error}, origin: contour.furn, spec, ox});
          ok = false;
        }

      });

      return ok;
    }


    /**
     * Спецификации соединений примыкающих профилей
     * @param elm {Profile}
     */
    function cnn_spec_nearest(elm) {
      const nearest = elm.nearest();
      if(nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm._attr._nearest_cnn) {
        cnn_add_spec(elm._attr._nearest_cnn, elm, {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: elm._attr._len,
          origin: cnn_row(elm.elm, nearest.elm)
        });
      }
    }

    /**
     * Спецификация профиля
     * @param elm {Profile}
     */
    function base_spec_profile(elm) {

      const {_row, rays} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const {b, e} = rays;

      if(!b.cnn || !e.cnn) {
        return;
      }
      b.check_err();
      e.check_err();

      const prev = b.profile;
      const next = e.profile;
      const row_cnn_prev = b.cnn.main_row(elm);
      const row_cnn_next = e.cnn.main_row(elm);
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      let row_spec;

      // добавляем строку спецификации
      const row_cnn = row_cnn_prev || row_cnn_next;
      if(row_cnn) {

        row_spec = new_spec_row({elm, row_base: row_cnn, nom: _row.nom, origin: cnn_row(_row.elm, prev ? prev.elm : 0), spec, ox});
        row_spec.qty = row_cnn.quantity;

        // уточняем размер
        const seam = $p.enm.angle_calculating_ways.СварнойШов;
        const d45 = Math.sin(Math.PI / 4);
        const dprev = row_cnn_prev ? (
          row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz
        ) : 0;
        const dnext = row_cnn_next ? (
          row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz
        ) : 0;

        row_spec.len = (_row.len - dprev - dnext)
          * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        // profile._len - то, что получится после обработки
        // row_spec.len - сколько взять (отрезать)
        elm._attr._len = _row.len;
        _row.len = (_row.len
          - (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz)
          - (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz))
          * 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        // припуск для гнутых элементов
        if(!elm.is_linear()) {
          row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
        }

        // дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
        if(row_cnn_prev && !row_cnn_prev.formula.empty()) {
          row_cnn_prev.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_prev,
            row_spec: row_spec
          });
        }
        else if(row_cnn_next && !row_cnn_next.formula.empty()) {
          row_cnn_next.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_next,
            row_spec: row_spec
          });
        }

        // РассчитатьКоличествоПлощадьМассу
        const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
        const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
        const {СоединениеПополам, Соединение} = $p.enm.angle_calculating_ways;
        calc_count_area_mass(
          row_spec,
          spec,
          _row,
          angle_calc_method_prev,
          angle_calc_method_next,
          angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0,
          angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0
        );
      }

      // добавляем спецификации соединений
      const len_angl = {
        angle: 0,
        alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
        alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
        len: row_spec ? row_spec.len * 1000 : _row.len,
        art1: false,
        art2: true
      };
      if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0, b.point)) {


        len_angl.angle = len_angl.alp2;

        // для ТОбразного и Незамкнутого контура надо рассчитать еще и с другой стороны
        if(b.cnn.cnn_type == $p.enm.cnn_types.t || b.cnn.cnn_type == $p.enm.cnn_types.i || b.cnn.cnn_type == $p.enm.cnn_types.xx) {
          if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm, e.point)) {
            cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
          }
        }
        // для угловых, добавляем из e.cnn строки с {art2: true}
        else {
          cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
        }

        // спецификацию с предыдущей стороны рассчитваем всегда
        len_angl.angle = len_angl.alp1;
        len_angl.art2 = false;
        len_angl.art1 = true;
        cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
      }

      // спецификация вставки
      elm.inset.calculate_spec({elm, ox});

      // если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
      cnn_spec_nearest(elm);

      // если у профиля есть доборы, добавляем их спецификации
      elm.addls.forEach(base_spec_profile);

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }

        len_angl.origin = inset;
        len_angl.angle = elm.angle_hor;
        len_angl.cnstr = elm.layer.cnstr;
        delete len_angl.art1;
        delete len_angl.art2;
        inset.calculate_spec({elm, len_angl, ox});

      });

    }

    /**
     * Спецификация сечения (водоотлива)
     * @param elm {Sectional}
     */
    function base_spec_sectional(elm) {

      const {_row, _attr, inset, layer} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      // во время расчетов возможна подмена объекта спецификации
      const spec_tmp = spec;

      // спецификация вставки
      inset.calculate_spec({elm, ox});

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
          const cx = Object.assign(ox.find_create_cx(elm.elm, inset.ref), inset.contour_attrs(layer));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        // рассчитаем спецификацию вставки
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: layer.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      // восстанавливаем исходную ссылку объекта спецификации
      spec = spec_tmp;

    }

    /**
     * Спецификация заполнения
     * @param elm {Filling}
     */
    function base_spec_glass(elm) {

      const {profiles, imposts, _row} = elm;

      if(_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const glength = profiles.length;

      // для всех рёбер заполнения
      for (let i = 0; i < glength; i++) {
        const curr = profiles[i];

        if(curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        const prev = (i == 0 ? profiles[glength - 1] : profiles[i - 1]).profile;
        const next = (i == glength - 1 ? profiles[0] : profiles[i + 1]).profile;
        const row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

        const len_angl = {
          angle: 0,
          alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
          alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
          len: row_cnn.length ? row_cnn[0].aperture_len : 0,
          origin: cnn_row(_row.elm, curr.profile.elm)

        };

        // добавляем спецификацию соединения рёбер заполнения с профилем
        cnn_add_spec(curr.cnn, curr.profile, len_angl);

      }

      // добавляем спецификацию вставки в заполнение
      elm.inset.calculate_spec({elm, ox});

      // для всех раскладок заполнения
      imposts.forEach(base_spec_profile);

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {
        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }
        inset.calculate_spec({elm, ox});
      });
    }


    /**
     * Спецификация вставок в контур
     * @param contour
     */
    function inset_contour_spec(contour) {

      // во время расчетов возможна подмена объекта спецификации
      const spec_tmp = spec;

      ox.inserts.find_rows({cnstr: contour.cnstr}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
          const cx = Object.assign(ox.find_create_cx(-contour.cnstr, inset.ref), inset.contour_attrs(contour));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        // рассчитаем спецификацию вставки
        const elm = {
          _row: {},
          elm: 0,
          clr: clr,
          layer: contour,
        };
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: contour.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      // восстанавливаем исходную ссылку объекта спецификации
      spec = spec_tmp;
    }

    /**
     * Основная cпецификация по соединениям и вставкам таблицы координат
     * @param scheme {Scheme}
     */
    function base_spec(scheme) {

      const {Contour, Filling, Sectional, Profile, ProfileConnective} = $p.Editor;

      // сбрасываем структуру обработанных соединений
      added_cnn_spec = {};

      // для всех контуров изделия
      for (const contour of scheme.getItems({class: Contour})) {

        // для всех профилей контура
        for (const elm of contour.children) {
          elm instanceof Profile && base_spec_profile(elm);
        }

        for (const elm of contour.children) {
          if(elm instanceof Filling) {
            // для всех заполнений контура
            base_spec_glass(elm);
          }
          else if(elm instanceof Sectional) {
            // для всех разрезов (водоотливов)
            base_spec_sectional(elm);
          }
        }

        // фурнитура контура
        furn_spec(contour);

        // спецификация вставок в контур
        inset_contour_spec(contour);

      }

      // для всех соединительных профилей
      for (const elm of scheme.l_connective.children) {
        if(elm instanceof ProfileConnective) {
          base_spec_profile(elm);
        }
      }

      // спецификация вставок в изделие
      inset_contour_spec({
        cnstr: 0,
        project: scheme,
        get perimeter() {
          return this.project.perimeter;
        }
      });

    }

    /**
     * Пересчет спецификации при записи изделия
     */
    this.recalc = function (scheme, attr) {

      //console.time("base_spec");
      //console.profile();


      // ссылки для быстрого доступа к свойствам объекта продукции
      ox = scheme.ox;
      spec = ox.specification;
      constructions = ox.constructions;
      coordinates = ox.coordinates;
      cnn_elmnts = ox.cnn_elmnts;
      glass_specification = ox.glass_specification;
      params = ox.params;

      // чистим спецификацию
      spec.clear();

      // массив продукций к добавлению в заказ
      ox._order_rows = [];

      // рассчитываем базовую сецификацию
      base_spec(scheme);

      // сворачиваем
      spec.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');


      //console.timeEnd("base_spec");
      //console.profileEnd();

      // информируем мир об окончании расчета координат
      scheme.draw_visualization();
      scheme.notify(scheme, 'coordinates_calculated', attr);


      // производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
      // внутри корректировки будут рассчитаны цены продажи и плановой себестоимости
      if(ox.calc_order_row) {
        $p.spec_building.specification_adjustment({
          scheme: scheme,
          calc_order_row: ox.calc_order_row,
          spec: spec,
          save: attr.save,
        }, true);
      }

      // информируем мир о завершении пересчета
      if(attr.snapshot) {
        scheme.notify(scheme, 'scheme_snapshot', attr);
      }

      // информируем мир о записи продукции
      if(attr.save) {

        // console.time("save");
        // console.profile();

        // сохраняем картинку вместе с изделием
        ox.save(undefined, undefined, {
          svg: {
            content_type: 'image/svg+xml',
            data: new Blob([scheme.get_svg()], {type: 'image/svg+xml'})
          }
        })
          .then(() => {
            $p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
            delete scheme._attr._saving;
            ox.calc_order.characteristic_saved(scheme, attr);
            scheme._scope.eve.emit('characteristic_saved', scheme, attr);

            // console.timeEnd("save");
            // console.profileEnd();

          })
          .then(() => setTimeout(() => {
            ox.calc_order._modified && ox.calc_order.save();
          }, 1000))
          .catch((ox) => {

            // console.timeEnd("save");
            // console.profileEnd();

            $p.record_log(ox);
            delete scheme._attr._saving;
            if(ox._data && ox._data._err) {
              $p.msg.show_msg(ox._data._err);
              delete ox._data._err;
            }
          });
      }
      else {
        delete scheme._attr._saving;
      }

      ox._data._loading = false;

    };

  }

  /**
   * Проверяет соответствие параметров отбора параметрам изделия
   * @param params {TabularSection} - табчасть параметров вставки или соединения
   * @param row_spec {TabularSectionRow}
   * @param elm {BuilderElement}
   * @param [cnstr] {Number} - номер конструкции или элемента
   * @return {boolean}
   */
  static check_params({params, row_spec, elm, cnstr, origin, ox}) {

    let ok = true;

    // режем параметры по элементу
    params.find_rows({elm: row_spec.elm}, (prm_row) => {
      // выполнение условия рассчитывает объект CchProperties
      ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
      if(!ok) {
        return false;
      }
    });

    return ok;
  }

  /**
   * Добавляет или заполняет строку спецификации
   * @param row_spec
   * @param elm
   * @param row_base
   * @param spec
   * @param [nom]
   * @param [origin]
   * @return {TabularSectionRow.cat.characteristics.specification}
   */
  static new_spec_row({row_spec, elm, row_base, nom, origin, spec, ox}) {
    if(!row_spec) {
      // row_spec = this.ox.specification.add();
      row_spec = spec.add();
    }
    row_spec.nom = nom || row_base.nom;
    if(!row_spec.nom.visualization.empty()) {
      row_spec.dop = -1;
    }
    else if(row_spec.nom.is_procedure) {
      row_spec.dop = -2;
    }
    row_spec.characteristic = row_base.nom_characteristic;
    if(!row_spec.characteristic.empty() && row_spec.characteristic.owner != row_spec.nom) {
      row_spec.characteristic = $p.utils.blank.guid;
    }
    row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr, elm, spec);
    row_spec.elm = elm.elm;
    if(origin) {
      row_spec.origin = origin;
    }
    return row_spec;
  }

  /**
   * РассчитатьQtyLen
   * @param row_spec
   * @param row_base
   * @param len
   */
  static calc_qty_len(row_spec, row_base, len) {

    const {nom} = row_spec;

    if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
      nom.cutting_optimization_type.empty() || nom.is_pieces) {
      if(!row_base.coefficient || !len) {
        row_spec.qty = row_base.quantity;
      }
      else {
        if(!nom.is_pieces) {
          row_spec.qty = row_base.quantity;
          row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
          if(nom.rounding_quantity) {
            row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
            row_spec.len = 0;
          }
          ;
        }
        else if(!nom.rounding_quantity) {
          row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
        }
        else {
          row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
        }
      }
    }
    else {
      row_spec.qty = row_base.quantity;
      row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
    }
  }

  /**
   * РассчитатьКоличествоПлощадьМассу
   * @param row_spec
   * @param row_coord
   */
  static calc_count_area_mass(row_spec, spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2) {

    if(!row_spec.qty) {
      // dop=-1 - визуализация, dop=-2 - техоперация,
      if(row_spec.dop >= 0) {
        spec.del(row_spec.row - 1, true);
      }
      return;
    }

    // если свойства уже рассчитаны в формуле, пересчет не выполняем
    if(row_spec.totqty1 && row_spec.totqty) {
      return;
    }

    //TODO: учесть angle_calc_method
    if(!angle_calc_method_next) {
      angle_calc_method_next = angle_calc_method_prev;
    }

    if(angle_calc_method_prev && !row_spec.nom.is_pieces) {

      const {Основной, СварнойШов, СоединениеПополам, Соединение, _90} = $p.enm.angle_calculating_ways;

      if((angle_calc_method_prev == Основной) || (angle_calc_method_prev == СварнойШов)) {
        row_spec.alp1 = row_coord.alp1;
      }
      else if(angle_calc_method_prev == _90) {
        row_spec.alp1 = 90;
      }
      else if(angle_calc_method_prev == СоединениеПополам) {
        row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
      }
      else if(angle_calc_method_prev == Соединение) {
        row_spec.alp1 = (alp1 || row_coord.alp1);
      }

      if((angle_calc_method_next == Основной) || (angle_calc_method_next == СварнойШов)) {
        row_spec.alp2 = row_coord.alp2;
      }
      else if(angle_calc_method_next == _90) {
        row_spec.alp2 = 90;
      }
      else if(angle_calc_method_next == СоединениеПополам) {
        row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
      }
      else if(angle_calc_method_next == Соединение) {
        row_spec.alp2 = (alp2 || row_coord.alp2);
      }
    }

    if(row_spec.len) {
      if(row_spec.width && !row_spec.s) {
        row_spec.s = row_spec.len * row_spec.width;
      }
    }
    else {
      row_spec.s = 0;
    }

    if(row_spec.s) {
      row_spec.totqty = row_spec.qty * row_spec.s;
    }
    else if(row_spec.len) {
      row_spec.totqty = row_spec.qty * row_spec.len;
    }
    else {
      row_spec.totqty = row_spec.qty;
    }

    row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

    ['len', 'width', 's', 'qty', 'alp1', 'alp2'].forEach((fld) => row_spec[fld] = row_spec[fld].round(4));
    ['totqty', 'totqty1'].forEach((fld) => row_spec[fld] = row_spec[fld].round(6));
  }

}

$p.ProductsBuilding = ProductsBuilding;
$p.products_building = new ProductsBuilding(true);


/* eslint-disable no-multiple-empty-lines,space-infix-ops */
/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  glob_spec_building
 * Created 26.05.2015
 */

class SpecBuilding {

  constructor($p) {

  }

  /**
   * Рассчитывает спецификацию в строке документа Расчет
   * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
   * @param prm
   * @param cancel
   */
  calc_row_spec (prm, cancel) {

  }

  /**
   * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
   * @param attr {Object}
   * @param with_price {Boolean}
   */
  specification_adjustment (attr, with_price) {

    const {scheme, calc_order_row, spec, save} = attr;
    const calc_order = calc_order_row._owner._owner;
    const order_rows = new Map();
    const adel = [];
    const ox = calc_order_row.characteristic;
    const nom = ox.empty() ? calc_order_row.nom : (calc_order_row.nom = ox.owner);

    // типы цен получаем заранее, т.к. они могут пригодиться при расчете корректировки спецификации
    $p.pricing.price_type(attr);

    // удаляем из спецификации строки, добавленные предыдущими корректировками
    spec.find_rows({ch: {in: [-1, -2]}}, (row) => adel.push(row));
    adel.forEach((row) => spec.del(row, true));

    // находим привязанные к продукции вставки и выполняем
    // здесь может быть как расчет допспецификации, так и доппроверки корректности параметров и геометрии
    $p.cat.insert_bind.insets(ox).forEach(({inset, elm_type}) => {

      const elm = {
        _row: {},
        elm: 0,
        get perimeter() {return scheme ? scheme.perimeter : []},
        clr: ox.clr,
        project: scheme,
      };
      const len_angl = {
        angle: 0,
        alp1: 0,
        alp2: 0,
        len: 0,
        cnstr: 0,
        origin: inset,
      };
      // рассчитаем спецификацию вставки
      inset.calculate_spec({elm, len_angl, ox, spec});

    });

    // синхронизируем состав строк - сначала удаляем лишние
    if(!ox.empty()){
      adel.length = 0;
      calc_order.production.forEach((row) => {
        if (row.ordn === ox){
          if (ox._order_rows.indexOf(row.characteristic) === -1){
            adel.push(row);
          }
          else {
            order_rows.set(row.characteristic, row);
          }
        }
      });
      adel.forEach((row) => calc_order.production.del(row.row-1));
    }

    const ax = [];

    // затем, добавляем в заказ строки, назначенные к вытягиванию
    ox._order_rows && ox._order_rows.forEach((cx) => {
      const row = order_rows.get(cx) || calc_order.production.add({characteristic: cx});
      row.nom = cx.owner;
      row.unit = row.nom.storage_unit;
      row.ordn = ox;
      row.len = cx.x;
      row.width = cx.y;
      row.s = cx.s;
      row.qty = calc_order_row.qty;
      row.quantity = calc_order_row.quantity;

      save && ax.push(cx.save().catch($p.record_log));
      order_rows.set(cx, row);
    });
    if(order_rows.size){
      attr.order_rows = order_rows;
    }

    if(with_price){
      // рассчитываем плановую себестоимость
      $p.pricing.calc_first_cost(attr);

      // рассчитываем стоимость продажи
      $p.pricing.calc_amount(attr);
    }

    if(save && !attr.scheme && (ox.is_new() || ox._modified)){
      ax.push(ox.save().catch($p.record_log));
    }

    return ax;
  }

}

// Экспортируем экземпляр модуля
$p.spec_building = new SpecBuilding($p);

/**
 * Составной тип в поле trans документов оплаты и отгрузки
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module glob_value_mgr
 *
 * Created 10.10.2016
 */

(function ({prototype}) {
  const {value_mgr} = prototype;
  prototype.value_mgr = function(row, f, mf, array_enabled, v) {
		const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
		if(tmp){
      return tmp;
    }
		if(f == 'trans'){
      return $p.doc.calc_order;
    }
		else if(f == 'partner'){
      return $p.cat.partners;
    }
	}
})($p.classes.DataManager);

return $p;
};
