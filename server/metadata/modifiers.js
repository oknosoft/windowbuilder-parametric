module.exports = function($p) {
/**
 * Дополнительные методы перечисления Типы соединений
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module enm_cnn_types
 */

(function(_mgr){


	/**
	 * Массивы Типов соединений
	 * @type Object
	 */
	_mgr.acn = {

	  cache: {},

    get ii() {
      return this.cache.ii || ( this.cache.ii = [_mgr.Наложение] );
    },

    get i() {
      return this.cache.i || ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
    },

    get a() {
      return this.cache.a
        || ( this.cache.a = [
          _mgr.УгловоеДиагональное,
          _mgr.УгловоеКВертикальной,
          _mgr.УгловоеКГоризонтальной,
          _mgr.КрестВСтык] );
    },

    get t() {
      return this.cache.t || ( this.cache.t = [_mgr.ТОбразное, _mgr.КрестВСтык] );
    },

	};


	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type Object
	 */
	Object.defineProperties(_mgr, {
	  ad: {
	    get: function () {
        return _mgr.УгловоеДиагональное;
      }
    },
    av: {
      get: function () {
        return _mgr.УгловоеКВертикальной;
      }
    },
    ah: {
      get: function () {
        return _mgr.УгловоеКГоризонтальной;
      }
    },
    t: {
      get: function () {
        return _mgr.ТОбразное;
      }
    },
    ii: {
      get: function () {
        return _mgr.Наложение;
      }
    },
    i: {
      get: function () {
        return _mgr.НезамкнутыйКонтур;
      }
    },
    xt: {
      get: function () {
        return _mgr.КрестПересечение;
      }
    },
    xx: {
      get: function () {
        return _mgr.КрестВСтык;
      }
    },

  });

})($p.enm.cnn_types);

/**
 * Дополнительные методы перечисления Типы элементов
 * @author Evgeniy Malyarov
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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_characteristics
 *
 * Created 16.03.2016
 */

// при старте приложения
$p.on({

	// загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
	predefined_elmnts_inited: function common_characteristics() {
		$p.off(common_characteristics);
		return $p.cat.characteristics.pouch_load_view("doc/nom_characteristics");
	}

});

// перед записью объекта и при изменении реквизита в форме
$p.cat.characteristics.on({

	// перед записью надо пересчитать наименование и рассчитать итоги
	before_save: function (attr) {

		// уточняем номенклатуру системы
    const {prod_nom, calc_order} = this;

    // контроль прав на запись характеристики
    if(calc_order.is_read_only){
      this._data._err = {
        title: 'Права доступа',
        type: 'alert-error',
        text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
      };
      return false;
    }

		// пересчитываем наименование
		const name = this.prod_name();
		if(name){
      this.name = name;
    }

		// дублируем контрагента для целей RLS
		this.partner = calc_order.partner;

	},

  // при изменении реквизита
  value_change: function (attr) {
	  // для вложенных вставок перезаполняем параметры
	  if(attr.field == 'inset' && attr.tabular_section == 'inserts'){
      this.add_inset_params(attr.value, attr.row.cnstr);
    }
  }


});

// свойства менеджера характеристики
Object.defineProperties($p.cat.characteristics, {

  // индивидуальная форма объекта
  form_obj: {
    value: function(pwnd, attr){

      const _meta = this.metadata();

      attr.draw_tabular_sections = function (o, wnd, tabular_init) {

        _meta.form.obj.tabular_sections_order.forEach((ts) => {
          if(ts == "specification"){
            // табчасть со специфическим набором кнопок
            tabular_init("specification", $p.injected_data["toolbar_characteristics_specification.xml"]);
            wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent("onclick", (btn_id) => {

              const selId = wnd.elmnts.grids.specification.getSelectedRowId();
              if(selId && !isNaN(Number(selId))){
                return o.open_origin(Number(selId)-1);
              }

              $p.msg.show_msg({
                type: "alert-warning",
                text: $p.msg.no_selected_row.replace("%1", "Спецификация"),
                title: o.presentation
              });

            });
          }else{
            tabular_init(ts);
          }
        });
      }

      return this.constructor.prototype.form_obj.call(this, pwnd, attr)
        .then(function (res) {
          if(res){
            o = res.o;
            wnd = res.wnd;
            return res;
          }
        });
    }
  }


});


// свойства объекта характеристики
Object.defineProperties($p.CatCharacteristics.prototype, {

  /**
   * Возврвщает строку заказа, которой принадлежит продукция
   */
  calc_order_row: {
    get: function () {
      let _calc_order_row;
      this.calc_order.production.find_rows({characteristic: this}, (_row) => {
        _calc_order_row = _row;
        return false;
      });
      return _calc_order_row;
    }
  },

  /**
   * Рассчитывает наименование продукции
   */
  prod_name: {
    value: function (short) {

      const {calc_order_row, calc_order, leading_product, sys, clr} = this;
      let name = "";

      if(calc_order_row){

        if(calc_order.number_internal)
          name = calc_order.number_internal.trim();

        else{
          // убираем нули из середины номера
          let num0 = calc_order.number_doc, part = "";
          for(let i = 0; i<num0.length; i++){
            if(isNaN(parseInt(num0[i])))
              name += num0[i];
            else
              break;
          }
          for(let i = num0.length-1; i>0; i--){
            if(isNaN(parseInt(num0[i])))
              break;
            part = num0[i] + part;
          }
          name += parseInt(part || 0).toFixed(0);
        }

        name += "/" + calc_order_row.row.pad();

        // для подчиненных, номер строки родителя
        if(!leading_product.empty()){
          name += ":" + leading_product.calc_order_row.row.pad();
        }

        // добавляем название системы
        if(!sys.empty()){
          name += "/" + sys.name;
        }

        if(!short){

          // добавляем название цвета
          if(!clr.empty()){
            name += "/" + this.clr.name;
          }

          // добавляем размеры
          if(this.x && this.y)
            name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
          else if(this.x)
            name += "/" + this.x.toFixed(0);
          else if(this.y)
            name += "/" + this.y.toFixed(0);

          if(this.z){
            if(this.x || this.y)
              name += "x" + this.z.toFixed(0);
            else
              name += "/" + this.z.toFixed(0);
          }

          if(this.s){
            name += "/S:" + this.s.toFixed(3);
          }

          // подмешиваем значения параметров
          let sprm = "";
          this.params.find_rows({cnstr: 0}, (row) => {
            if(row.param.include_to_name && sprm.indexOf(String(row.value)) == -1){
              sprm && (sprm += ';');
              sprm += String(row.value);
            }
          });
          if(sprm){
            name += "|" + sprm;
          }
        }
      }
      return name;
    }
  },

  /**
   * Возвращает номенклатуру продукции по системе
   */
  prod_nom: {

    get: function () {

      if(!this.sys.empty()){

        var setted,
          param = this.params;

        if(this.sys.production.count() == 1){
          this.owner = this.sys.production.get(0).nom;

        }else if(this.sys.production.count() > 1){
          this.sys.production.each(function (row) {

            if(setted)
              return false;

            if(row.param && !row.param.empty()){
              param.find_rows({cnstr: 0, param: row.param, value: row.value}, function () {
                setted = true;
                param._owner.owner = row.nom;
                return false;
              });
            }

          });
          if(!setted){
            this.sys.production.find_rows({param: $p.utils.blank.guid}, function (row) {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }
          if(!setted){
            this.owner = this.sys.production.get(0).nom;
          }
        }
      }

      return this.owner;
    }

  },

  /**
   * Добавляет параметры вставки
   * @param inset
   * @param cnstr
   */
  add_inset_params: {
    value: function (inset, cnstr, blank_inset) {

      var ts_params = this.params,
        params = [];

      ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, function (row) {
        if(params.indexOf(row.param) == -1){
          params.push(row.param);
        }
        return row.param;
      });

      inset.used_params.forEach(function (param) {
        if(params.indexOf(param) == -1){
          ts_params.add({
            cnstr: cnstr,
            inset: blank_inset || inset,
            param: param
          })
          params.push(param)
        }
      })
    }
  },

  /**
   * Открывает форму происхождения строки спецификации
   */
  open_origin: {
    value: function (row_id) {
      try{
        let {origin} = this.specification.get(row_id);
        if(typeof origin == "number"){
          origin = this.cnn_elmnts.get(origin-1).cnn;
        }
        if(origin.is_new()){
          return $p.msg.show_msg({
            type: "alert-warning",
            text: `Пустая ссылка на настройки в строке №${row_id+1}`,
            title: o.presentation
          });
        }
        origin.form_obj();
      }
      catch (err){
        $p.record_log(err);
      }
    }
  },

  /**
   * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
   * @param elm {Number} - номер элемента или контура
   * @param origin {CatInserts} - порождающая вставка
   * @return {CatCharacteristics}
   */
  find_create_cx: {
    value: function (elm, origin) {
      const {_manager, ref, calc_order, params, inserts} = this;
      if(!_manager._find_cx_sql){
        _manager._find_cx_sql = $p.wsql.alasql.compile("select top 1 ref from cat_characteristics where leading_product = ? and leading_elm = ? and origin = ?")
      }
      const aref = _manager._find_cx_sql([ref, elm, origin]);
      const cx = aref.length ? $p.cat.characteristics.get(aref[0].ref, false) :
        $p.cat.characteristics.create({
          calc_order: calc_order,
          leading_product: this,
          leading_elm: elm,
          origin: origin
        }, false, true)._set_loaded();

      // переносим в cx параметры
      const {length, width} = $p.job_prm.properties;
      cx.params.clear(true);
      params.find_rows({cnstr: -elm, inset: origin}, (row) => {
        if(row.param != length && row.param != width){
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
  },

});



/**
 * ### Форма выбора типового блока
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_characteristics_form_selection_block
 *
 * Created 23.12.2015
 */

(function($p){

	const _mgr = $p.cat.characteristics;
  const _meta = _mgr.metadata()._clone();
	let selection_block, wnd;

	// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
	_mgr.form_selection_block = function(pwnd, attr = {}){

		if(!selection_block){
			selection_block = {
				_obj: {
					_calc_order: $p.utils.blank.guid
				}
			};
			_meta.form = {
				selection: {
					fields: ["presentation","svg"],
					cols: [
						{"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
						{"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
					]
				}
			};

			selection_block.__define({

				// виртуальные метаданные для поля фильтра по заказу
				_metadata: {
					get : function(){

						// возвращаем типовые метаданные зарактеристики, но могли бы вернуть изменённый клон
						//var calc_order = $p.cat.characteristics.metadata().fields.calc_order._clone();
						// calc_order.choice_links = [{
						// 	name: ["selection",	"s"],
						// 	path: [
						// 		function(o, f){
						//
						// 			if($p.utils.is_data_obj(o)){
						// 				return o.s > 0;
						//
						// 			}else{
						// 				var refs = "";
						// 				t.project._dp.sys.elmnts.find_rows(selection, function (row) {
						// 					if(refs)
						// 						refs += ", ";
						// 					refs += "'" + row.nom.ref + "'";
						// 				});
						// 				return "_t_.ref in (" + refs + ")";
						// 			}
						// 		}]}
						// ];

						return {
							fields: {
								calc_order: _meta.fields.calc_order
							}
						};
					}
				},

				// виртуальный датаменеджер для поля фильтра по заказу
				_manager: {
					get: function () {
						return {
							class_name: "dp.fake"
						};
					}
				},

				// при изменении заказа, обновляем табличную часть
				calc_order: {
					get: function () {
						return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
					},

					set: function (v) {
						if(!v || v == this._obj.calc_order){
              return;
            }
            // если вместо заказа прибежала харакетристика - возвращаем её в качестве результата
            if(v._block){
              wnd && wnd.close();
              return attr.on_select && attr.on_select(v._block);
            }
						$p.CatCharacteristics.prototype.__setter.call(this, "calc_order", v);

						if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount()){
              wnd.elmnts.filter.call_event();
            }

						if(!$p.utils.is_empty_guid(this._obj.calc_order) &&
							$p.wsql.get_user_param("template_block_calc_order") != this._obj.calc_order){
							$p.wsql.set_user_param("template_block_calc_order", this._obj.calc_order);
						}
					}
				}
			});
		}

		// объект отбора по ссылке на расчет в продукции
		if(selection_block.calc_order.empty()){
			selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
		}
		if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			$p.job_prm.builder.base_block.some((o) => {
				selection_block.calc_order = o;
				$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
				return true;
			});
		}

		// начальное значение - выбранные в предыдущий раз типовой блок
		attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

		// подсовываем типовой форме списка изменённые метаданные
		attr.metadata = _meta;

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
					return crefs.length ? _mgr.pouch_load_array(crefs, true) : crefs;
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
            const presentation = (o.calc_order_row.note || o.note || o.name) + "<br />" + o.owner.name;
						if(!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase()))
							crefs.push({
								ref: o.ref,
								presentation: presentation,
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
			get_option_list: (val, selection) => new Promise((resolve, reject) => {

			  setTimeout(() => {
          const l = [];

          $p.job_prm.builder.base_block.forEach(({note, presentation, ref}) => {
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

        }, $p.job_prm.builder.base_block ? 0 : 1000)
			})
		});
		wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};

})($p);

/**
 * ### Дополнительные методы справочника Цвета
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
		value: function(clr, clr_elm, clr_sch){
		  const {predefined_name} = clr;
			if(predefined_name){
			  switch (predefined_name){
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
          default :
            return clr_elm;
        }
			}
      return clr.empty() ? clr_elm : clr
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
						else if(sys instanceof $p.DataProcessorObj){
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
              .then(function (obj) {
                // регистрируем цвет в couchdb
                return obj.register_on_server()
              })
              .then(function (obj) {
                pwnd.on_select.call(pwnd, obj);
              })
              .catch(function (err) {
                $p.msg.show_msg({
                  type: "alert-warning",
                  text: "Недостаточно прав для добавления составного цвета",
                  title: "Составной цвет"
                });
              })
          }

          wnd.close();
          return false;
        }
      }

      const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);


			function get_option_list(val, selection) {

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

				return this.constructor.prototype.get_option_list.call(this, val, selection);
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

					Object.unobserve(eclr);

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

			return $p.DataManager.prototype.sync_grid.call(this, attr, grid);
		}
	}
});


$p.CatClrs.prototype.__define({

  // записывает элемент цвета на сервере
  register_on_server: {
    value: function () {
      return $p.wsql.pouch.save_obj(this, {
        db: $p.wsql.pouch.remote.ram
      })
        .then(function (obj) {
          return obj.save();
        })
    }
  },

  // возвращает стороны, на которых цвет
  sides: {
    get: function () {
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
  }

});


/**
 * ### Дополнительные методы справочника _Соединения_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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

      // если второй элемент вертикальный - меняем местами эл 1-2 при поиске
      if(nom1 instanceof $p.Editor.ProfileItem &&
        nom2 instanceof $p.Editor.ProfileItem &&
        cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
        nom1.orientation != $p.enm.orientations.Вертикальная &&
        nom2.orientation == $p.enm.orientations.Вертикальная ){

        return this.nom_cnn(nom2, nom1, cnn_types);
      }

      // если оба элемента - профили, определяем сторону
      const side = is_outer ? $p.enm.cnn_sides.Снаружи :
        (!ign_side && nom1 instanceof $p.Editor.ProfileItem && nom2 instanceof $p.Editor.ProfileItem && nom2.cnn_side(nom1));

      let onom2, a1, a2, thickness1, thickness2, is_i = false, art1glass = false, art2glass = false;

      if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
        is_i = true;
        onom2 = nom2 = $p.cat.nom.get();
      }
      else{
        if(nom2 instanceof $p.Editor.BuilderElement){
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
        if(nom1 instanceof $p.Editor.Filling){
          art1glass = true;
          thickness1 = nom1.thickness;
        }
        else if(nom2 instanceof $p.Editor.Filling){
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
      if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type)!=-1)){

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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
 *
 *
 * @module cat_divisions
 *
 * Created by Evgeniy Malyarov on 27.05.2017.
 */


Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value: function (val, selection) {
      const list = [];
      $p.current_user.acl_objs.find_rows({type: "cat.divisions"}, (row) => {
        if(list.indexOf(row.acl_obj) == -1){
          list.push(row.acl_obj);
          row.acl_obj._children.forEach((o) => {
            if(list.indexOf(o) == -1){
              list.push(o);
            }
          })
        }
      });
      if(!list.length){
        return $p.CatManager.prototype.get_option_list.call(this, val, selection);
      }

      function check(v){
        if($p.utils.is_equal(v.value, val))
          v.selected = true;
        return v;
      }

      const l = [];
      $p._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 08.04.2016
 *
 * @module cat_elm_visualization
 */

// публичные методы объекта
$p.CatElm_visualization.prototype.__define({

	draw: {
		value: function (elm, layer, offset) {

		  const {CompoundPath} = elm.project._scope;

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

});

/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

$p.on({

  // обработчик события после загрузки данных в озу
	pouch_load_data_loaded: function cat_formulas_data_loaded () {

		$p.off(cat_formulas_data_loaded);

		// читаем элементы из pouchdb и создаём формулы
		$p.cat.formulas.pouch_find_rows({ _top: 500, _skip: 0 })
			.then((rows) =>{
				rows.forEach((row) => {
					// формируем списки печатных форм и внешних обработок
					if(row.parent == $p.cat.formulas.predefined("printing_plates")){
						row.params.find_rows({param: "destination"}, (dest) => {
							const dmgr = $p.md.mgr_by_class_name(dest.value);
							if(dmgr){
								if(!dmgr._printing_plates){
                  dmgr._printing_plates = {};
                }
								dmgr._printing_plates["prn_" + row.ref] = row;
							}
						})
					}
				});
			});
	}
});

$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj) {

			// создаём функцию из текста формулы
			if(!this._data._formula && this.formula){
			  if(this.async){
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          this._data._formula = (new AsyncFunction("obj", this.formula)).bind(this);
        }
        else{
          this._data._formula = (new Function("obj", this.formula)).bind(this);
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
				return _formula(obj)

				  // показываем отчет в отдельном окне
					.then((doc) => doc instanceof $p.SpreadsheetDocument && doc.print());

			}
			else{
        return _formula && _formula(obj)
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
 * &copy; http://www.oknosoft.ru 2014-2015
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
    value: function (val, selection) {

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
          $p._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

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
      return $p.CatManager.prototype.get_option_list.call(this, val, selection);
    },
    configurable: true
  }

});


(($p) => {

  /**
   * Методы объекта фурнитуры
   */
  const Proto = $p.CatFurns;
  $p.CatFurns = class CatFurns extends Proto {

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

      this.selection_params.each((row) => aprm.indexOf(row.param)==-1 && !row.param.is_calculated && aprm.push(row.param));

      this.specification.each((row) => row.nom instanceof $p.CatFurns && row.nom.add_furn_prm(aprm, afurn_set));

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

              const invert = contour.direction == $p.enm.open_directions.Правое,
                elm = contour.profile_by_furn_side(dop_row.side, cache),
                len = elm._row.len,
                sizefurn = elm.nom.sizefurn,
                dx0 = (len - elm._attr._len) / 2,
                dx1 = $p.job_prm.builder.add_d ? sizefurn : 0,
                faltz = len - 2 * sizefurn;

              let invert_nearest = false, coordin = 0;

              if(dop_row.offset_option == $p.enm.offset_options.Формула){
                if(!dop_row.formula.empty()){
                  coordin = dop_row.formula.execute({ox, elm, contour, len, sizefurn, dx0, dx1, faltz, invert, dop_row});
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
              }
              else{
                procedure_row.handle_height_min = elm.elm;
                procedure_row.coefficient = coordin;
              }
              // если сказано учесть припуск - добавляем dx0
              if(dop_row.overmeasure){
                procedure_row.coefficient += dx0;
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
            if(!row_furn.formula.empty()){
              row_furn.formula.execute({ox, contour, row_furn, row_spec});
            }
          }
        }
      });

      return res;
    }

  }

  /**
   * Методы строки спецификации
   */
  const ProtoRow = $p.CatFurnsSpecificationRow;

  // переопределяем свойства nom и nom_set
  delete ProtoRow.prototype.nom;

  const {fields} = $p.md.get("cat.furns").tabular_sections.specification;
  fields.nom_set = fields.nom;

  // переопределяем прототип
  $p.CatFurnsSpecificationRow = class CatFurnsSpecificationRow extends ProtoRow {

    /**
     * Проверяет ограничения строки фурнитуры
     * @param contour {Contour}
     * @param cache {Object}
     */
    check_restrictions(contour, cache) {
      const {elm, dop, handle_height_min, handle_height_max} = this;
      const {direction, h_ruch, cnstr} = contour;

      if(h_ruch < handle_height_min || (handle_height_max && h_ruch > handle_height_max)){
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

  }

})($p);

/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
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

(($p) => {

  const Proto = $p.CatInserts;

  // переопределяем прототип
  $p.CatInserts = class CatInserts extends Proto {

    /**
     * Возвращает номенклатуру вставки в завсисмости от свойств элемента
     */
    nom(elm, strict) {

      if(!strict && this._data.nom){
        return this._data.nom;
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
        this._data.nom = typeof _nom == 'string' ? $p.cat.nom.get(_nom) : _nom;
      }
      else{
        // TODO: реализовать фильтр
        this._data.nom = _nom;
      }

      return _nom;
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
        var irow = main_rows[0],
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
          else{
            res.x = contour.w + irow.sz;
            res.y = contour.h + irow.sz;
            res.s = ((res.x * res.y) / 1000000).round(3)
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
          for(let fld in row._metadata.fields){
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
          row.nom.filtered_spec({elm, len_angl, own_row, ox}).forEach((subrow) => {
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
        // для вставок в профиль способ расчета количество не учитывается
        else if(profile_items.indexOf(_row.elm_type) != -1 || row_ins_spec.count_calc_method == ДляЭлемента){
          calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
        }
        else{

          if(row_ins_spec.count_calc_method == ПоПлощади){
            row_spec.qty = row_ins_spec.quantity;
            row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.s = _row.s;
          }
          else if(row_ins_spec.count_calc_method == ПоПериметру){
            const row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
            elm.perimeter.forEach((rib) => {
              row_prm._row._mixin(rib);
              row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
              if(this.check_restrictions(row_ins_spec, row_prm, true)){
                row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
                calc_qty_len(row_spec, row_ins_spec, rib.len);
                calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
              }
              row_spec = null;
            });

          }
          else if(row_ins_spec.count_calc_method == ПоШагам){
            const h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
            // (row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
            // row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление)
            if(row_ins_spec.step){
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
                calc_qty_len(row_spec, row_ins_spec, w);
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

})($p);


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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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

			if(!attr.characteristic){
        attr.characteristic = $p.utils.blank.guid;
      }
			else if($p.utils.is_data_obj(attr.characteristic)){
        attr.characteristic = attr.characteristic.ref;
      }
			if(!attr.date){
        attr.date = new Date();
      }

      // если для номенклатуры существует структура цен, ищем подходящую
      const {_price} = this._data;
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
          const {characteristics} = $p.cat;
				  for(let clrx in _price){
            const cx = characteristics.get(clrx, false, true);
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
        if(!price){
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
        price = attr.formula.execute({
          nom: this,
          characteristic: $p.cat.characteristics.get(attr.characteristic, false),
          date: attr.date,
          price: price,
          currency: currency
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
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
 * &copy; http://www.oknosoft.ru 2014-2015
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

			this.elmnts.each(function(row){
				if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
					(by_default == "rows" || !__noms.some(function (e) {
						return row.nom == e.nom;
					})))
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
			return __noms.map(function (e) {
				return e.nom;
			});
		}
	},

	/**
	 * @method refill_prm
	 * @for cat.Production_params
	 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
	 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
	 */
	refill_prm: {
		value: function (ox, cnstr) {

			var prm_ts = !cnstr ? this.product_params : this.furn_params,
				adel = [];

			// если в характеристике есть лишние параметры - удаляем
			if(!cnstr){
				cnstr = 0;
				ox.params.find_rows({cnstr: cnstr}, function (row) {
					if(prm_ts.find_rows({param: row.param}).length == 0)
						adel.push(row);
				});
				adel.forEach(function (row) {
					ox.params.del(row);
				});
			}

			// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
			prm_ts.forEach(function (default_row) {

				var row;
				ox.params.find_rows({cnstr: cnstr, param: default_row.param}, function (_row) {
					row = _row;
					return false;
				});

				// если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
				if(!row){
					if(cnstr)
						return;
					row = ox.params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});
				}

				if(row.hide != default_row.hide)
					row.hide = default_row.hide;

				if(default_row.forcibly && row.value != default_row.value)
					row.value = default_row.value;
			});

			if(!cnstr){
				ox.sys = this;
				ox.owner = ox.prod_nom;

				// одновременно, перезаполним параметры фурнитуры
				ox.constructions.forEach((row) => {
					if(!row.furn.empty())
						ox.sys.refill_prm(ox, row.cnstr);
				})
			}
		}
	}

});


/**
 * ### Дополнительные методы справочника _Права внешних пользователей_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_users_acl
 */


$p.cat.users.__define({

  // при загрузке пользователей, морозим объект, чтобы его невозможно было изменить из интерфейса
	load_array: {
		value: function(aattr, forse){
			const res = [];
			for(let aobj of aattr){
			  if(!aobj.acl_objs){
          aobj.acl_objs = [];
        }
        const {acl} = aobj;
			  delete aobj.acl;
        const obj = new $p.CatUsers(aobj, this);
        const {_obj} = obj;
        _obj._acl = acl;
        obj._set_loaded();
        Object.freeze(obj);
        Object.freeze(_obj);
        for(let j in _obj){
          if(typeof _obj[j] == "object"){
            Object.freeze(_obj[j]);
            for(let k in _obj[j]){
              typeof _obj[j][k] == "object" && Object.freeze(_obj[j][k]);
            }
          }
        }
				res.push(obj);
			}
			return res;
		},
    configurable: false
	}

});

$p.CatUsers.prototype.__define({

  /**
   * ### Роль доступна
   *
   * @param name {String}
   * @returns {Boolean}
   */
  role_available: {
    value: function (name) {
      return this.acl_objs._obj.some(function (row) {
        return row.type == name;
      });
    }
  },

  get_acl: {
    value: function(class_name) {
      const acn = class_name.split(".");
      const {_acl} = this._obj;
      return _acl && _acl[acn[0]] && _acl[acn[0]][acn[1]] ? _acl[acn[0]][acn[1]] : "e";
    }
  },

	/**
	 * ### Идентификаторы доступных контрагентов
	 * Для пользователей с ограниченным доступом
	 *
	 * @returns {Array}
	 */
	partners_uids: {
		get: function () {
			var res = [];
			this.acl_objs.each(function (row) {
				if(row.acl_obj instanceof $p.CatPartners)
					res.push(row.acl_obj.ref)
			});
			return res;
		}
	}
});

/**
 * ### Дополнительные методы ПВХ Предопределенные элементы
 * Предопределенные элементы - аналог констант для хранения ссылочных и списочных настроек приложения
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cch_predefined_elmnts
 */

(function($p){

	// Подписываемся на событие окончания загрузки локальных данных
	$p.on({
		pouch_load_data_loaded: function predefined_elmnts_data_loaded() {

			$p.off(predefined_elmnts_data_loaded);

			// читаем элементы из pouchdb и создаём свойства
			$p.cch.predefined_elmnts.pouch_find_rows({_raw: true, _top: 500, _skip: 0})
				.then((rows) => {

					const parents = {};

					rows.forEach((row) => {
						if(row.is_folder && row.synonym){
							var ref = row._id.split("|")[1];
							parents[ref] = row.synonym;
              !$p.job_prm[row.synonym] && $p.job_prm.__define(row.synonym, { value: {} });
						}

					});

					rows.forEach((row) => {

						if(!row.is_folder && row.synonym && parents[row.parent] && !$p.job_prm[parents[row.parent]][row.synonym]){

							let _mgr;

							if(row.type.is_ref){
								const tnames = row.type.types[0].split(".");
								_mgr = $p[tnames[0]][tnames[1]]
							}

							if(row.list == -1){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: (() => {
										const res = {};
										row.elmnts.forEach((row) => {
											res[row.elm] = _mgr ? _mgr.get(row.value, false) : row.value;
										});
										return res;
									})()
								});

							}
							else if(row.list){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: row.elmnts.map((row) => {
									  if(_mgr){
                      const value = _mgr.get(row.value, false);
                      if(!$p.utils.is_empty_guid(row.elm)){
                        value._formula = row.elm;
                      }
                      return value;
                    }else{
                      return row.value;
                    }
									})
								});

                if(row.synonym == "calculated"){

                }
							}
							else{

								if($p.job_prm[parents[row.parent]].hasOwnProperty(row.synonym)){
                  delete $p.job_prm[parents[row.parent]][row.synonym];
                }

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: _mgr ? _mgr.get(row.value, false) : row.value,
									configurable: true
								});
							}

						}
					});
				})
				.then(() => {

					// рассчеты, помеченные, как шаблоны, загрузим в память заранее
					setTimeout(() => {

            if(!$p.job_prm.builder){
              $p.job_prm.builder = {};
            }
						if(!$p.job_prm.builder.base_block){
              $p.job_prm.builder.base_block = [];
            }
            if(!$p.job_prm.pricing){
              $p.job_prm.pricing = {};
            }

						// дополним base_block шаблонами из систем профилей
						$p.cat.production_params.forEach((o) => {
							if(!o.is_folder)
								o.base_blocks.forEach((row) => {
									if($p.job_prm.builder.base_block.indexOf(row.calc_order) == -1){
                    $p.job_prm.builder.base_block.push(row.calc_order);
                  }
								});
						});

						$p.job_prm.builder.base_block.forEach((o) => o.load());

					}, 1000);

					// даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
					setTimeout(() => {
						$p.eve.callEvent("predefined_elmnts_inited");
					}, 200);

				});

		}
	});

	const _mgr = $p.cch.predefined_elmnts;


	/**
	 * Переопределяем геттер значения
	 *
	 * @property value
	 * @override
	 * @type {*}
	 */
	delete $p.CchPredefined_elmnts.prototype.value;
	$p.CchPredefined_elmnts.prototype.__define({

		value: {
			get: function () {

				const mf = this.type;
				const res = this._obj ? this._obj.value : "";
				let mgr, ref;

				if(this._obj.is_folder){
          return "";
        }
				if(typeof res == "object"){
          return res;
        }
				else if(mf.is_ref){
					if(mf.digits && typeof res === "number"){
            return res;
          }
					if(mf.hasOwnProperty("str_len") && !$p.utils.is_guid(res)){
            return res;
          }
					if(mgr = $p.md.value_mgr(this._obj, "value", mf)){
						if($p.utils.is_data_mgr(mgr)){
              return mgr.get(res, false);
            }
						else{
              return $p.utils.fetch_type(res, mgr);
            }
					}
					if(res){
						console.log(["value", mf, this._obj]);
						return null;
					}
				}
				else if(mf.date_part){
          return $p.utils.fix_date(this._obj.value, true);
        }
        else if(mf.digits){
          return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty("str_len"));
        }
        else if(mf.types[0]=="boolean"){
          return $p.utils.fix_boolean(this._obj.value);
        }
				else{
          return this._obj.value || "";
        }

				return this.characteristic.clr;
			},

			set: function (v) {

				if(this._obj.value === v){
          return;
        }

				Object.getNotifier(this).notify({
					type: 'update',
					name: 'value',
					oldValue: this._obj.value
				});
				this._obj.value = $p.utils.is_data_obj(v) ? v.ref : v;
				this._data._modified = true;
			}
		}
	});

	/**
	 * ### Форма элемента
	 *
	 * @method form_obj
	 * @override
	 * @param pwnd
	 * @param attr
	 * @returns {*}
	 */
	_mgr.form_obj = function(pwnd, attr){

		let o, wnd;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then((res) => {
				if(res){
					o = res.o;
					wnd = res.wnd;
					return res;
				}
			});
	}

})($p);

/**
 * ### Дополнительные методы плана видов характеристик _Свойства объектов_
 * аналог подсистемы _Свойства_ БСП
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cch_properties
 */


$p.cch.properties.__define({

	/**
	 * ### Проверяет заполненность обязательных полей
	 *
	 * @method check_mandatory
	 * @override
	 * @param prms {Array}
	 * @param title {String}
	 * @return {Boolean}
	 */
	check_mandatory: {
		value: function(prms, title){

			var t, row;

			// проверяем заполненность полей
			for(t in prms){
				row = prms[t];
				if(row.param.mandatory && (!row.value || row.value.empty())){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.bld_empty_param + row.param.presentation,
						title: title || $p.msg.bld_title});
					return true;
				}
			}
		}
	},

	/**
	 * ### Возвращает массив доступных для данного свойства значений
	 *
	 * @method slist
	 * @override
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
	 * @return {Array}
	 */
	slist: {
		value: function(prop, ret_mgr){

			var res = [], rt, at, pmgr, op = this.get(prop);

			if(op && op.type.is_ref){
				// параметры получаем из локального кеша
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){

							if(ret_mgr)
								ret_mgr.mgr = pmgr;

							if(pmgr.class_name=="enm.open_directions")
								pmgr.get_option_list().forEach(function(v){
									if(v.value && v.value!=$p.enm.tso.folding)
										res.push(v);
								});

							else if(pmgr.class_name.indexOf("enm.")!=-1 || !pmgr.metadata().has_owners)
								res = pmgr.get_option_list();

							else
								pmgr.find_rows({owner: prop}, function(v){
									res.push({value: v.ref, text: v.presentation});
								});
						}
					}
			}
			return res;
		}
	}

});

$p.CchProperties.prototype.__define({

  /**
   * ### Является ли значение параметра вычисляемым
   *
   * @property is_calculated
   * @type Boolean
   */
  is_calculated: {
    get: function () {
      return ($p.job_prm.properties.calculated || []).indexOf(this) != -1;
    }
  },

  /**
   * ### Рассчитывает значение вычисляемого параметра
   * @param obj {Object}
   * @param [obj.row]
   * @param [obj.elm]
   * @param [obj.ox]
   */
  calculated_value: {
    value: function (obj) {
      if(!this._calculated_value){
        if(this._formula){
          this._calculated_value = $p.cat.formulas.get(this._formula);
        }else{
          return;
        }
      }
      return this._calculated_value.execute(obj)
    }
  },

  check_compare: {
    value: function (left, right, comparison_type) {
      const {eq, ne, gt, gte, lt, lte, nin, inh, ninh} = $p.enm.comparison_types;
      switch(comparison_type) {
        case ne:
          return left != right;
        case gt:
          return left > right;
        case gte:
          return left >= right;
        case lt:
          return left < right;
        case lte:
          return left <= right;
        case nin:
          if(Array.isArray(left) && !Array.isArray(right)){
            return left.indexOf(right) == -1;
          }
          else if(!Array.isArray(left) && Array.isArray(right)){
            return right.indexOf(left) == -1;
          }
          else if(!Array.isArray(left) && !Array.isArray(right)){
            return right != left;
          }
          break;
        case $p.enm.comparison_types.in:
          if(Array.isArray(left) && !Array.isArray(right)){
            return left.indexOf(right) != -1;
          }
          else if(!Array.isArray(left) && Array.isArray(right)){
            return right.indexOf(left) != -1;
          }
          else if(!Array.isArray(left) && !Array.isArray(right)){
            return left == right;
          }
          break;
        case inh:
          return $p.utils.is_data_obj(left) ? left._hierarchy(right) : left == right;
        case ninh:
          return $p.utils.is_data_obj(left) ? !left._hierarchy(right) : left != right;
        default:
          return left == right;
      }
    }
  },

  /**
   * ### Проверяет условие в строке отбора
   */
  check_condition: {
    value: function ({row_spec, prm_row, elm, cnstr, origin, ox, calc_order}) {

      const {is_calculated} = this;

      // значение параметра
      const val = is_calculated ? this.calculated_value({
        row: row_spec,
        cnstr: cnstr || 0,
        elm,
        ox,
        calc_order
      }) : this.extract_value(prm_row);

      let ok = false;

      // если сравнение на равенство - решаем в лоб, если вычисляемый параметр типа массив - выясняем вхождение значения в параметр
      if(ox && !Array.isArray(val) && (prm_row.comparison_type.empty() || prm_row.comparison_type == $p.enm.comparison_types.eq)){
        if(is_calculated){
          ok = val == prm_row.value;
        }
        else{
          ox.params.find_rows({
            cnstr: cnstr || 0,
            inset: origin || $p.utils.blank.guid,
            param: this,
            value: val
          }, () => {
            ok = true;
            return false;
          });
        }
      }
      // вычисляемый параметр - его значение уже рассчитано формулой (val) - сравниваем со значением в строке ограничений
      else if(is_calculated){
        const value = this.extract_value(prm_row);
        ok = this.check_compare(val, this.extract_value(prm_row), prm_row.comparison_type);
      }
      // параметр явно указан в табчасти параметров изделия
      else{
        ox.params.find_rows({
          cnstr: cnstr || 0,
          inset: origin || $p.utils.blank.guid,
          param: this
        }, ({value}) => {
          // value - значение из строки параметра текущей продукции, val - знаяение из параметров отбора
          ok = this.check_compare(value, val, prm_row.comparison_type);
          return false;
        });
      }
      return ok;
    }
  },

  /**
   * Извлекает значение параметра с учетом вычисляемости
   */
  extract_value: {
    value: function ({comparison_type, txt_row, value}) {

      switch(comparison_type) {

        case $p.enm.comparison_types.in:
        case $p.enm.comparison_types.nin:

          if(!txt_row){
            return value;
          }
          try{
            const arr = JSON.parse(txt_row);
            const {types} = this.type;
            if(types.length == 1){
              const mgr = $p.md.mgr_by_class_name(types[0]);
              return arr.map((ref) => mgr.get(ref, false));
            }
            return arr;
          }
          catch(err){
            return value;
          }

        default:
          return value;
      }
    }
  },

  /**
   * Возвращает массив связей текущего параметра
   */
  params_links: {
    value: function (attr) {

      // первым делом, выясняем, есть ли ограничитель на текущий параметр
      if(!this.hasOwnProperty("_params_links")){
        this._params_links = $p.cat.params_links.find_rows({slave: this})
      }

      return this._params_links.filter((link) => {
        let ok = true;
        // для всех записей ключа параметров
        link.master.params.forEach((row) => {
          // выполнение условия рассчитывает объект CchProperties
          ok = row.property.check_condition({
            cnstr: attr.grid.selection.cnstr,
            ox: attr.obj._owner._owner,
            prm_row: row,
            elm: attr.obj,
          });
          if(!ok){
            return false;
          }
        });
        return ok;
      });
    }
  },

  /**
   * Проверяет и при необходимости перезаполняет или устанваливает умолчание value в prow
   */
  linked_values: {
    value: function (links, prow) {
      const values = [];
      let changed;
      // собираем все доступные значения в одном массиве
      links.forEach((link) => link.values.forEach((row) => values.push(row)));
      // если значение доступно в списке - спокойно уходим
      if(values.some((row) => row._obj.value == prow.value)){
        return;
      }
      // если есть явный default - устанавливаем
      if(values.some((row) => {
          if(row.forcibly){
            prow.value = row._obj.value;
            return true;
          }
          if(row.by_default && (!prow.value || prow.value.empty && prow.value.empty())){
            prow.value = row._obj.value;
            changed = true;
          }
        })){
        return true;
      }
      // если не нашли лучшего, установим первый попавшийся
      if(changed){
        return true;
      }
      if(values.length){
        prow.value = values[0]._obj.value;
        return true;
      }
    }
  },

  /**
   * ### Дополняет отбор фильтром по параметрам выбора
   * Используется в полях ввода экранных форм
   * @param filter {Object} - дополняемый фильтр
   * @param attr {Object} - атрибуты OCombo
   */
  filter_params_links: {
    value: function (filter, attr) {
      // для всех отфильтрованных связей параметров
      this.params_links(attr).forEach((link) => {
        // если ключ найден в параметрах, добавляем фильтр
        if(!filter.ref){
          filter.ref = {in: []}
        }
        if(filter.ref.in){
          link.values._obj.forEach((row) => {
            if(filter.ref.in.indexOf(row.value) == -1){
              filter.ref.in.push(row.value);
            }
          });
        }
      });
    }
  }

});

/**
 * ### Модификаторы обработки _builder_pen_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_builder_pen
 */

$p.dp.builder_pen.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset = paper.project.default_inset({elm_type: this.elm_type});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	},

});

$p.dp.builder_lay_impost.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset_by_y = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрГоризонталь
			});
			this.inset_by_x = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрВертикаль
			});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	}
});

/**
 * Контекстный отчет по ценам номенклатуры
 *
 * @module dp_builder_price
 *
 * Created by Evgeniy Malyarov on 12.02.2017.
 */

// переопределяем форму обработки в качестве отчета по ценам номенклатуры
$p.DpBuilder_price.prototype.__define({

  form_obj: {
    value: function (pwnd, attr) {

      const {nom, goods, _manager, _metadata} = this;

      // форма в модальном диалоге
      const options = {
        name: 'wnd_obj_' + _manager.class_name,
        wnd: {
          top: 80 + Math.random()*40,
          left: 120 + Math.random()*80,
          width: 780,
          height: 400,
          modal: true,
          center: false,
          pwnd: pwnd,
          allow_close: true,
          allow_minmax: true,
          caption: `Цены: <b>${nom.name}</b>`
        }
      };

      const wnd = $p.iface.dat_blank(null, options.wnd);

      const ts_captions = {
        "fields":["price_type","nom_characteristic","date","price","currency"],
        "headers":"Тип Цен,Характеристика,Дата,Цена,Валюта",
        "widths":"200,*,150,120,100",
        "min_widths":"150,200,100,100,100",
        "aligns":"",
        "sortings":"na,na,na,na,na",
        "types":"ro,ro,dhxCalendar,ro,ro"
      };

      return $p.wsql.pouch.local.doc.query('doc/doc_nom_prices_setup_slice_last', {
        limit : 1000,
        include_docs: false,
        reduce: false,
        startkey: [nom.ref, ''],
        endkey: [nom.ref, '\uffff']
      })
        .then((data) => {
        if(data && data.rows){
          data.rows.forEach((row) => {
            goods.add({
              nom_characteristic: row.key[1],
              price_type: row.key[2],
              date: row.value.date,
              price: row.value.price,
              currency: row.value.currency
            })
          });

          goods.sort(["price_type","nom_characteristic","date"]);

          wnd.elmnts.grids.goods = wnd.attachTabular({
            obj: this,
            ts: "goods",
            pwnd: wnd,
            ts_captions: ts_captions
          });
          wnd.detachToolbar();
        }
      })

    }
  }
});

/**
 * ### Модификаторы обработки _Заказ покупателя_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */


(($p) => {

  const Proto = $p.DpBuyers_order;

  // переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
  delete Proto.prototype.clr;
  delete Proto.prototype.sys;

  // переопределяем прототип
  $p.DpBuyers_order = class DpBuyers_order extends Proto {

    get clr() {
      return this.characteristic.clr;
    }
    set clr(v) {
      const {characteristic, _data} = this;
      if((!v && characteristic.empty()) || characteristic.clr == v){
        return;
      }
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'clr',
        oldValue: characteristic.clr
      });
      characteristic.clr = v;
      _data._modified = true;
    }

    get sys() {
      return this.characteristic.sys;
    }
    set sys(v) {
      const {characteristic, _data} = this;
      if((!v && characteristic.empty()) || characteristic.sys == v){
        return;
      }
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'sys',
        oldValue: characteristic.sys
      });
      characteristic.sys = v;
      _data._modified = true;
    }

    get extra_fields() {
      return this.characteristic.params;
    }
  }

})($p);

/**
 * ### Форма ДобавитьСписокПродукции
 * В этой форме пользователь задаёт размеры и параметры вставок, по которым будет сформирована продукция заказа
 *
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */



$p.dp.buyers_order.on({

  add_row: function ({row, tabular_section, field}) {
    // установим валюту и тип цен по умолчению при добавлении строки
    if(tabular_section == "production"){
      row.qty = row.quantity = 1;
    }
  },

  value_change: function({row, tabular_section, field, value}){
    if(tabular_section == "production"){
      if(field == "len" || field == "height" ) {
        row[field] = value;
      }
      if(row.height != 0 && row.height != 0) {
        row.s = (row.height * row.len / 1000000).round(3);
      }
    }
  },

});

class CalcOrderFormProductList {

  constructor(pwnd, calc_order) {

    this.dp = $p.dp.buyers_order.create();
    this.dp.calc_order = calc_order;

    this.attr = {

      // командная панель формы
      toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

      // переопределяем обработчики кнопок командной панели формы
      toolbar_click: this.toolbar_click.bind(this),

      // переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_pg_header: this.draw_pg_header.bind(this),

      // переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_tabular_sections: this.draw_tabular_sections.bind(this)

    };

    this.dp.presentation = calc_order.presentation + " - добавление продукции";

    this.dp.form_obj(pwnd, this.attr);


  }

  // навешиваем обработчики событий на элементы управления
  draw_pg_header(dp, wnd) {
    const {production} = wnd.elmnts.grids;
    const refill_prms = this.refill_prms.bind(this);
    production.attachEvent("onRowSelect", refill_prms);
    production.attachEvent("onEditCell", (stage, rId, cInd) => {
      !cInd && setTimeout(refill_prms);
    });
  }

  // переопределяем страницы формы
  draw_tabular_sections(dp, wnd, tabular_init) {

    this.wnd = wnd;
    wnd.maximize();

    const {elmnts} = wnd;
    elmnts.frm_toolbar.hideItem("bs_print");

    // добавляем layout на первую страницу
    wnd.detachObject(true);
    wnd.maximize();
    elmnts.layout = wnd.attachLayout({
      pattern: "2E",
      cells: [{
        id: "a",
        text: "Продукция",
        header: false,
      }, {
        id: "b",
        text: "Параметры",
        header: false,
      }],
      offsets: {top: 0, right: 0, bottom: 0, left: 0}
    });

    // добавляем табчасть продукции
    this.meta_production = $p.dp.buyers_order.metadata("production").fields._clone();
    elmnts.grids.production = elmnts.layout.cells('a').attachTabular({
      metadata: this.meta_production,
      obj: dp,
      ts: 'production',
      pwnd: wnd,
    });

    // добавляем табчасть пареметров
    elmnts.grids.params = elmnts.layout.cells('b').attachHeadFields({
      obj: dp,
      ts: 'product_params',
      pwnd: wnd,
      selection: {elm: -1},
      oxml: {'Параметры продукции': []},
    });

    const height = elmnts.layout.cells('a').getHeight() + elmnts.layout.cells('b').getHeight();
    elmnts.layout.cells('a').setHeight(height * 0.7);

  }

  // команды формы
  toolbar_click(btn_id) {
    if(btn_id == "btn_ok"){
      this.dp._data._modified = false;
      this.dp.calc_order.process_add_product_list(this.dp)
        .then(() => {
          this.wnd.close();
          this.wnd = this.dp = this.attr = null;
        })
        .catch((err) => {

        });
    }
  }

  refill_prms() {
    const {meta_production, wnd} = this;
    const {production, params} = wnd.elmnts.grids;
    if (production && params) {
      const row = production.get_cell_field();
      if(row){
        params.selection = {elm: row.obj.row};
        if (!row.obj.inset.empty()) {
          $p.cat.clrs.selection_exclude_service(meta_production.clr, row.obj.inset);
        }
      }
    }
  }

}



/**
 * ### Модуль менеджера и документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order
 */

// переопределяем формирование списка выбора
$p.doc.calc_order.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

// подписки на события
$p.doc.calc_order.on({

	// после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
	after_create: function (attr) {

	  const {acl_objs} = $p.current_user;

		//Организация
		acl_objs.find_rows({by_default: true, type: $p.cat.organizations.class_name}, (row) => {
      this.organization = row.acl_obj;
			return false;
		});

		//Подразделение
    $p.DocCalc_order.set_department.call(this)

		//Контрагент
		acl_objs.find_rows({by_default: true, type: $p.cat.partners.class_name}, (row) => {
      this.partner = row.acl_obj;
			return false;
		});

		//Договор
		this.contract = $p.cat.contracts.by_partner_and_org(this.partner, this.organization);

		//Менеджер
    this.manager = $p.current_user;

		//СостояниеТранспорта
    this.obj_delivery_state = $p.enm.obj_delivery_states.Черновик;

		//Номер документа
		return this.new_number_doc();

	},

	// перед записью надо присвоить номер для нового и рассчитать итоги
	before_save: function (attr) {

		let doc_amount = 0,
      amount_internal = 0,
      sys_profile = "",
      sys_furn = "";

		const {Отклонен, Отозван, Шаблон, Подтвержден, Отправлен} = $p.enm.obj_delivery_states;

		// если установлен признак проведения, проверим состояние транспорта
		if(this.posted){
			if (this.obj_delivery_state == Отклонен || this.obj_delivery_state == Отозван || this.obj_delivery_state == Шаблон){
				$p.msg.show_msg({
					type: "alert-warning",
					text: "Нельзя провести заказ со статусом<br/>'Отклонён', 'Отозван' или 'Шаблон'",
					title: this.presentation
				});
				return false;
			}
			else if(this.obj_delivery_state != Подтвержден){
				this.obj_delivery_state = Подтвержден;
			}
		}else if(this.obj_delivery_state == Подтвержден){
			this.obj_delivery_state = Отправлен;
		}

		// проверим заполненность подразделения
    if(this.obj_delivery_state == Шаблон){
      this.department = $p.utils.blank.guid;
    }else if(this.department.empty()){
      $p.msg.show_msg({
        type: "alert-warning",
        text: "Не заполнен реквизит 'офис продаж' (подразделение)",
        title: this.presentation
      });
      return false;
    }

		this.production.each((row) => {

			doc_amount += row.amount;
			amount_internal += row.amount_internal;

			if(!row.characteristic.calc_order.empty()){
				const name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
				if(sys_profile.indexOf(name) == -1){
					if(sys_profile)
						sys_profile += " ";
					sys_profile += name;
				}

				// row.characteristic.constructions.each((row) => {
				// 	if(row.parent && !row.furn.empty()){
				// 		const name = row.furn.name_short || row.furn.name;
				// 		if(sys_furn.indexOf(name) == -1){
				// 			if(sys_furn)
				// 				sys_furn += " ";
				// 			sys_furn += name;
				// 		}
				// 	}
				// });
			}
		});

		this.doc_amount = doc_amount.round(2);
		this.amount_internal = amount_internal.round(2);
		this.sys_profile = sys_profile;
		//this.sys_furn = sys_furn;
		this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency).round(2);

		const {_obj, obj_delivery_state, category, number_internal, partner, client_of_dealer, note} = this;

		// фильтр по статусу
    if(obj_delivery_state=='Шаблон'){
      _obj.state = 'template'
    }
    else if(category=='Сервис'){
      _obj.state = 'service';
    }
    else if(category=='Рекламация'){
      _obj.state = 'complaints';
    }
    else if(obj_delivery_state=='Отправлен'){
      _obj.state = 'sent';
    }
    else if(obj_delivery_state=='Отклонен'){
      _obj.state = 'declined';
    }
    else if(obj_delivery_state=='Подтвержден'){
      _obj.state = 'confirmed';
    }
    else if(obj_delivery_state=='Архив'){
      _obj.state = 'zarchive';
    }
    else{
      _obj.state = 'draft';
    }

		// строка поиска
		_obj.search = (this.number_doc +
      (number_internal ? " " + number_internal : "") +
      (client_of_dealer ? " " + client_of_dealer : "") +
      (partner.name ? " " + partner.name : "") +
      (note ? " " + note : "")).toLowerCase();

	},

	// при изменении реквизита
	value_change: function (attr) {

		// реквизиты шапки
		if(attr.field == "organization"){
			this.new_number_doc();
			if(this.contract.organization != attr.value){
        this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);
      }
		}
		else if(attr.field == "partner" && this.contract.owner != attr.value){
			this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);

		}
    // табчасть продукции
		else if(attr.tabular_section == "production"){

			if(attr.field == "nom" || attr.field == "characteristic" || attr.field == "quantity"){
			  if(attr.row.characteristic.empty() || attr.row.characteristic.calc_order.empty()){
          const fake_prm = {
            spec: attr.row.characteristic.specification,
            calc_order_row: attr.row
          }
          $p.pricing.price_type(fake_prm);
          $p.pricing.calc_first_cost(fake_prm);
          $p.pricing.calc_amount(fake_prm);
        }
			}

			if(attr.field == "price" || attr.field == "price_internal" || attr.field == "quantity" ||
				attr.field == "discount_percent" || attr.field == "discount_percent_internal"){

				attr.row[attr.field] = attr.value;

				attr.row.amount = (attr.row.price * ((100 - attr.row.discount_percent)/100) * attr.row.quantity).round(2);

				// если есть внешняя цена дилера, получим текущую дилерскую наценку
				if(!attr.no_extra_charge){
					var prm = {calc_order_row: attr.row},
            extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");

					// если пересчет выполняется менеджером, используем наценку по умолчанию
          if(!$p.current_user.partners_uids.length || !extra_charge){
            $p.pricing.price_type(prm);
            extra_charge = prm.price_type.extra_charge_external;
          }

					if(attr.field != "price_internal" && extra_charge && attr.row.price){
            attr.row.price_internal = (attr.row.price * (100 - attr.row.discount_percent)/100 * (100 + extra_charge)/100).round(2);
          }
				}

				attr.row.amount_internal = (attr.row.price_internal * ((100 - attr.row.discount_percent_internal)/100) * attr.row.quantity).round(2);

				// ставка и сумма НДС
				if(this.vat_consider){
          const {НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС} = $p.enm.vat_rates;
					attr.row.vat_rate = attr.row.nom.vat_rate.empty() ? НДС18 : attr.row.nom.vat_rate;
					switch (attr.row.vat_rate){
						case НДС18:
						case НДС18_118:
							attr.row.vat_amount = (attr.row.amount * 18 / 118).round(2);
							break;
						case НДС10:
						case НДС10_110:
							attr.row.vat_amount = (attr.row.amount * 10 / 110).round(2);
							break;
						case НДС20:
						case НДС20_120:
							attr.row.vat_amount = (attr.row.amount * 20 / 120).round(2);
							break;
						case НДС0:
						case БезНДС:
							attr.row.vat_amount = 0;
							break;
					}
					if(!this.vat_included){
						attr.row.amount = (attr.row.amount + attr.row.vat_amount).round(2);
					}
				}
				else{
					attr.row.vat_rate = $p.enm.vat_rates.БезНДС;
					attr.row.vat_amount = 0;
				}

				this.doc_amount = this.production.aggregate([], ["amount"]).round(2);
				this.amount_internal = this.production.aggregate([], ["amount_internal"]).round(2);

				// TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

			}

		}
	}
});

// свойства и методы объекта
(() => {

  const Proto = $p.DocCalc_order;
  delete Proto.prototype.contract;

  $p.DocCalc_order = class DocCalc_order extends Proto {

    /**
     * Возвращает валюту документа
     */
    get doc_currency() {
      const currency = this.contract.settlements_currency;
      return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
    }

    /**
     * При установке договора, синхронно устанавливаем параметры НДС
     */
    get contract() {
      return this._getter('contract')
    }
    set contract(v) {
      this._setter('contract',v);
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
        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
          options.keys.push([row.characteristic.ref, "305e374b-3aa9-11e6-bf30-82cf9717e145", 1, 0])
        }
      });

      return $p.wsql.pouch.remote.doc.query('server/dispatching', options)
        .then(function (result) {
          var res = {};
          result.rows.forEach(function (row) {
            if(row.value.plan){
              row.value.plan = $p.moment(row.value.plan).format("L")
            }
            if(row.value.fact){
              row.value.fact = $p.moment(row.value.fact).format("L")
            }
            res[row.key[0]] = row.value
          });
          return res;
        });
    }

    /**
     * Возвращает данные для печати
     */
    print_data() {
      const {organization, bank_account, contract, manager} = this;
      const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
      const get_imgs = [];
      const {contact_information_kinds} = $p.cat;

      // заполняем res теми данными, которые доступны синхронно
      const res = {
        АдресДоставки: this.shipping_address,
        ВалютаДокумента: this.doc_currency.presentation,
        ДатаЗаказаФорматD: $p.moment(this.date).format("L"),
        ДатаЗаказаФорматDD: $p.moment(this.date).format("LL"),
        ДатаТекущаяФорматD: $p.moment().format("L"),
        ДатаТекущаяФорматDD: $p.moment().format("LL"),
        ДоговорДатаФорматD: $p.moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format("L"),
        ДоговорДатаФорматDD: $p.moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format("LL"),
        ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
        ДоговорСрокДействия: $p.moment(contract.validity).format("L"),
        ЗаказНомер: this.number_doc,
        Контрагент: this.partner.presentation,
        КонтрагентОписание: this.partner.long_presentation,
        КонтрагентДокумент: "",
        КонтрагентКЛДолжность: "",
        КонтрагентКЛДолжностьРП: "",
        КонтрагентКЛИмя: "",
        КонтрагентКЛИмяРП: "",
        КонтрагентКЛК: "",
        КонтрагентКЛОснованиеРП: "",
        КонтрагентКЛОтчество: "",
        КонтрагентКЛОтчествоРП: "",
        КонтрагентКЛФамилия: "",
        КонтрагентКЛФамилияРП: "",
        КонтрагентЮрФизЛицо: "",
        КратностьВзаиморасчетов: this.settlements_multiplicity,
        КурсВзаиморасчетов: this.settlements_course,
        ЛистКомплектацииГруппы: "",
        ЛистКомплектацииСтроки: "",
        Организация: organization.presentation,
        ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, "") || "Москва",
        ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
          if(row.kind == contact_information_kinds.predefined("ЮрАдресОрганизации") && row.presentation){
            return row.presentation;
          }
          else if(val){
            return val;
          }
          else if(row.presentation && (
              row.kind == contact_information_kinds.predefined("ФактАдресОрганизации") ||
              row.kind == contact_information_kinds.predefined("ПочтовыйАдресОрганизации")
            )){
            return row.presentation;
          }
        }, ""),
        ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
          if(row.kind == contact_information_kinds.predefined("ТелефонОрганизации") && row.presentation){
            return row.presentation;
          }
          else if(val){
            return val;
          }
          else if(row.kind == contact_information_kinds.predefined("ФаксОрганизации") && row.presentation){
            return row.presentation;
          }
        }, ""),
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
        СотрудникДолжность: manager.individual_person.Должность || "менеджер",
        СотрудникДолжностьРП: manager.individual_person.ДолжностьРП,
        СотрудникИмя: manager.individual_person.Имя,
        СотрудникИмяРП: manager.individual_person.ИмяРП,
        СотрудникОснованиеРП: manager.individual_person.ОснованиеРП,
        СотрудникОтчество: manager.individual_person.Отчество,
        СотрудникОтчествоРП: manager.individual_person.ОтчествоРП,
        СотрудникФамилия: manager.individual_person.Фамилия,
        СотрудникФамилияРП: manager.individual_person.ФамилияРП,
        СотрудникФИО: manager.individual_person.Фамилия +
        (manager.individual_person.Имя ? " " + manager.individual_person.Имя[1].toUpperCase() + "." : "" )+
        (manager.individual_person.Отчество ? " " + manager.individual_person.Отчество[1].toUpperCase() + "." : ""),
        СотрудникФИОРП: manager.individual_person.ФамилияРП + " " + manager.individual_person.ИмяРП + " " + manager.individual_person.ОтчествоРП,
        СуммаДокумента: this.doc_amount.toFixed(2),
        СуммаДокументаПрописью: this.doc_amount.in_words(),
        СуммаДокументаБезСкидки: this.production._obj.reduce(function (val, row){
          return val + row.quantity * row.price;
        }, 0).toFixed(2),
        СуммаСкидки: this.production._obj.reduce(function (val, row){
          return val + row.discount;
        }, 0).toFixed(2),
        СуммаНДС: this.production._obj.reduce(function (val, row){
          return val + row.vat_amount;
        }, 0).toFixed(2),
        ТекстНДС: this.vat_consider ? (this.vat_included ? "В том числе НДС 18%" : "НДС 18% (сверху)") : "Без НДС",
        ТелефонПоАдресуДоставки: this.phone,
        СуммаВключаетНДС: contract.vat_included,
        УчитыватьНДС: contract.vat_consider,
        ВсегоНаименований: this.production.count(),
        ВсегоИзделий: 0,
        ВсегоПлощадьИзделий: 0,
        Продукция: [],
      };


      // дополняем значениями свойств
      this.extra_fields.forEach((row) => {
        res["Свойство" + row.property.name.replace(/\s/g,"")] = row.value.presentation || row.value;
      });

      // TODO: дополнить датами доставки и монтажа
      res.МонтажДоставкаСамовывоз = !this.shipping_address ? "Самовывоз" : "Монтаж по адресу: " + this.shipping_address;

      // получаем логотип организации
      for(let key in organization._attachments){
        if(key.indexOf("logo") != -1){
          get_imgs.push(organization.get_attachment(key)
            .then((blob) => {
              return $p.utils.blob_as_text(blob, blob.type.indexOf("svg") == -1 ? "data_url" : "")
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

        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

          res.Продукция.push(this.row_description(row));

          res.ВсегоИзделий+= row.quantity;
          res.ВсегоПлощадьИзделий+= row.quantity * row.s;

          get_imgs.push($p.cat.characteristics.get_attachment(row.characteristic.ref, "svg")
            .then((blob) => $p.utils.blob_as_text(blob))
            .then((svg_text) => {
              res.ПродукцияЭскизы[row.characteristic.ref] = svg_text;
            })
            .catch((err) => err && err.status != 404 && $p.record_log(err))
          );
        }
      });
      res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

      return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
        .then(() => {

          if(!window.QRCode)
            return new Promise((resolve, reject) => {
              $p.load_script("lib/qrcodejs/qrcode.js", "script", resolve);
            });

        })
        .then(() => {

          const svg = document.createElement("SVG");
          svg.innerHTML = "<g />";
          const qrcode = new QRCode(svg, {
            text: "http://www.oknosoft.ru/zd/",
            width: 100,
            height: 100,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H,
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

      if(!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic){
        this.production.find_rows({characteristic: row.characteristic}, (prow) => {
          row = prow;
          return false;
        })
      }
      const {characteristic, nom} = row;
      const res = {
        ref: characteristic.ref,
        НомерСтроки: row.row,
        Количество: row.quantity,
        Ед: row.unit.name || "шт",
        Цвет: characteristic.clr.name,
        Размеры: row.len + "x" + row.width + ", " + row.s + "м²",
        Номенклатура: nom.name_full || nom.name,
        Характеристика: characteristic.name,
        Заполнения: "",
        Фурнитура: "",
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
        if(res.Заполнения.indexOf(name) == -1){
          if(res.Заполнения){
            res.Заполнения += ", ";
          }
          res.Заполнения += name;
        }
      });

      // наименования фурнитур
      characteristic.constructions.forEach((row) => {
        const {name} = row.furn;
        if(name && res.Фурнитура.indexOf(name) == -1){
          if(res.Фурнитура){
            res.Фурнитура += ", ";
          }
          res.Фурнитура += name;
        }
      });

      // параметры, помеченные к включению в описание
      const params = new Map();
      characteristic.params.forEach((row) => {
        if(row.param.include_to_description){
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
     * Заполняет табчасть планирования данными по умолчанию
     */
    fill_plan(confirmed) {

      // если табчасть не пустая - задаём вопрос
      if(this.planning.count() && !confirmed){
        dhtmlx.confirm({
          title: $p.msg.main_title,
          text: $p.msg.tabular_will_cleared.replace('%1', "Планирование"),
          cancel: $p.msg.cancel,
          callback: function(btn) {
            if(btn){
              this.fill_plan(true);
            }
          }.bind(this)
        });
        return;
      }

      this.planning.clear();

    }

    /**
     * Выясняет, можно ли редактировать данный объект
     */
    get is_read_only() {
      const {obj_delivery_state, posted, _deleted} = this;
      const {Черновик, Шаблон, Отозван} = $p.enm.obj_delivery_states;
      let ro = false;
      // технолог может изменять шаблоны
      if(obj_delivery_state == Шаблон){
        ro = !$p.current_user.role_available("ИзменениеТехнологическойНСИ");
      }
      // ведущий менеджер может изменять проведенные
      else if(posted || _deleted){
        ro = !$p.current_user.role_available("СогласованиеРасчетовЗаказов");
      }
      else if(!obj_delivery_state.empty()){
        ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
      }
      return ro;
    }

    /**
     * Загружает в RAM данные характеристик продукций заказа
     * @return {Promise.<TResult>|*}
     */
    load_production() {
      const prod = [];
      this.production.forEach((row) => {
        const {nom, characteristic} = row;
        if (!characteristic.empty() && characteristic.is_new() && !nom.is_procedure && !nom.is_service && !nom.is_accessory) {
          prod.push(characteristic.ref);
        }
      });
      const mgr = $p.cat.characteristics;
      return (mgr.pouch_load_array ? mgr.pouch_load_array(prod) : mgr.adapter.load_array(mgr, prod))
        .then(() => {
        prod.length = 0;
        this.production.forEach((row) => {
          const {nom, characteristic} = row;
          if (!characteristic.empty() && !nom.is_procedure && !nom.is_service && !nom.is_accessory) {
            prod.push(characteristic);
          }
        });
        return prod;
      });
    }

    create_product_row({row_spec, elm, len_angl, params, create, grid}) {

      const row = this.production.add({
        qty: 1,
        quantity: 1,
        discount_percent_internal: $p.wsql.get_user_param("discount_percent_internal", "number")
      });

      if(grid){
        this.production.sync_grid(grid);
        grid.selectRowById(row.row);
      }

      if(!create){
        return row;
      }

      // объект продукции создаём, но из базы не читаем и пока не записываем
      return $p.cat.characteristics.create({
        ref: $p.utils.generate_guid(),
        calc_order: this,
        product: row.row
      }, true)
        .then((ox) => {
          // устанавливаем характеристику в строке заказа
          row.characteristic = ox;
          // записываем расчет, если не сделали этого ранее, чтобы не погибла ссылка на расчет в характеристике
          return this.is_new() ? this.save().then(() => ox) : ox;
      })
        .then((ox) => {
          // если указана строка-генератор, заполняем реквизиты
          if(row_spec instanceof $p.DpBuyers_orderProductionRow){
            ox.owner = row.nom = row_spec.inset.nom(elm);
            ox.origin = row_spec.inset;
            ox.x = row.len = row_spec.len;
            ox.y = row.width = row_spec.height;
            ox.z = row_spec.depth;
            ox.s = row.s = row_spec.s;
            ox.clr = row_spec.clr;
            row.qty = row.quantity = row_spec.quantity;
            ox.note = row.note = row_spec.note;

            if(params){
              params.find_rows({elm: row_spec.row}, (prow) => {
                ox.params.add(prow, true);
              });
            }

            ox.name = ox.prod_name();
          }
          return row;
      });

    }

    /**
     * Создаёт продукции заказа по массиву строк и параметров
     * @method process_add_product_list
     * @param dp {DpBuyers_order} - экземпляр обработки с заполненными табличными частями
     */
    process_add_product_list(dp) {

      return new Promise((resolve, reject) => {

        dp.production.forEach(async (row_spec) => {
          if(row_spec.inset.empty()){
            return;
          }

          // рассчитываем спецификацию по текущей вставке
          const len_angl = {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: row_spec.len,
            origin: row_spec.inset,
            cnstr: 0
          };
          const elm = {
            elm: 0,
            angle_hor: 0,
            get _row() {return this},
            get clr() {return row_spec.clr},
            get len() {return row_spec.len},
            get height() {return row_spec.height},
            get depth() {return row_spec.depth},
            get s() {return row_spec.s},
            get perimeter() {return [{len: row_spec.len, angle: 0}, {len: row_spec.height, angle: 90}]},
            get x1() {return 0},
            get y1() {return 0},
            get x2() {return row_spec.height},
            get y2() {return row_spec.len},
          };
          // создаём строку заказа с уникальной харктеристикой
          const row_prod = await this.create_product_row({row_spec, elm, len_angl, params: dp.product_params, create: true});
          row_spec.inset.calculate_spec({elm, len_angl, ox: row_prod.characteristic});

          // сворачиваем
          row_prod.characteristic.specification.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");

          // производим дополнительную корректировку спецификации и рассчитываем цены
          $p.spec_building.specification_adjustment({
            //scheme: scheme,
            calc_order_row: row_prod,
            spec: row_prod.characteristic.specification,
            save: true,
          }, true);

        });

        resolve();

      });
    }

    /**
     * Устанавливает подразделение по умолчанию
     */
    static set_department() {
      const department = $p.wsql.get_user_param("current_department");
      if(department){
        this.department = department;
      }
      if(this.department.empty() || this.department.is_new()){
        $p.current_user.acl_objs && $p.current_user.acl_objs.find_rows({by_default: true, type: $p.cat.divisions.class_name}, (row) => {
          if(this.department != row.acl_obj){
            this.department = row.acl_obj;
          }
          return false;
        });
      }
    }

  }
})();


return $p;
};
