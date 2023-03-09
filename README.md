[Как подключиться к сервису, если вы клиент _Производителя_ или планируете им стать](https://github.com/oknosoft/windowbuilder-parametric/blob/master/how%20to%20connect.md)

# Параметрические заказы онлайн
Микросервис параметрических заказов для облачного сервиса [Заказ дилера](http://www.oknosoft.ru/zd/) предоставляет HTTP API для:

- Создания заказов в сервисе _Заказ дилера_ и учетной системе _Производителя_
- Получения информации о составе и статусе сформированных заказов

## Формирование заказов
- В своей учетной системе, клиент формирует _Заказ поставщику_
- С помощью специальной обработки (кнопка в заказе или списке заказов или регламентное задание), данные отправляются в сервис _Заказы онлайн_
- В реальном времени в базе _Производителя_ создаётся _Заказ покупателя_, рассчитывается спецификация и стоимость с учетом индивидуальных прайсов клиентов
- В реальном времени, клиент получает ответ сервиса, что ошибок в текущем заказе нет - цвета, количества и размеры соответствуют возможностям _Производителя_. Ответ содержит точные цены, которые клиент помещает в свой _Заказ поставщику_, самостоятельно формирует и оплачивает счет

## Согласование и диспетчеризация
- В сервисе поддержаны следующие статусы заказов:
  + `Черновик` - заказ создан клиентом и зарегистрирован в сервисе, но не отправлен _Производителю_ - такие заказы клиент может удалять или произвольно изменять, они не влияют на взаиморасчеты и не попадают в план и задание на производство
  + `Отправлен` - заказ обрабатывается в учетной системе _Производителя_, но еще не включен в задание на производство. Клиент не может изменить заказ в статусе `Отправлен`, но может его _Отозвать_
  + `Отозван` - по учетным последствиям не отличается от `Черновика`. Статус позволяет понять, что этот черновик уже побывал на стороне _Производителя_ и был отозван по инициативе клиента (как правило, чтобы внести изменения в состав и размеры изделий заказа)
  + `Отклонен` - по учетным последствиям не отличается от `Черновика`. Статус позволяет понять, что этот черновик уже побывал на стороне _Производителя_ и был возвращён (как правило, из-за невозможности изготовить изделия заказанных цветов и размеров)
  + `Согласован` - заказ включен в _Задание на производство_. Отозвать такой заказ в автоматическом режиме невозможно, т.к. на изделия этого заказа уже выполнена оптимизация раскроя, напечатаны этикетки и т.д. Изменения запущенных в работу заказов возможны только в ручном режиме и требуют участия менеджера
- Сервис предоставляет информацию по оплатам и отгрузкам как в разрезе конкретного заказа, так и за произвольный отрезок времени <sup>(*) не реализовано в текущей версии</sup>
- Сервис предоставляет диспетчерскую информацию о датах и моментах времени напиловки, упаковки и погрузки в машины <sup>(*) не реализовано в текущей версии</sup>

## Визуальный интерфейс
- При регистрации в сервисе, клиент получает логин, пароль и суффикс подключения. Эти учетные данные, используются как для невизуального взаимодействия через HTTP API, так и для авторизации в личном кабинете
- Создавать заказы, отслеживать статусы, анализировать отчеты, можно как в браузере, так и посредством HTTP API. Для системы нет никакой разницы, создан заказ руками оператора в браузере или сформирован автоматически запросом к сервису из учетной системы клиента

## Помощь в подключении
При необходимости, наши специалисты готовы оказать содействие в настройке подключения к сервису, вплоть до заказной разработки программного интерфейса.
Стандартную [обработку для 1С:УПП](https://github.com/oknosoft/windowbuilder-parametric/tree/master/1c), можно использовать без изменений, либо адаптировать к особенностям учетной системы клиента

## HTTP API
Микросервис обрабатывает следующие http запросы:

### POST /prm/doc.calc_order/:ref
Например, `post https://crystallit.oknosoft.ru/prm/doc.calc_order/54429bcc-475a-11e7-956f-9cb654bba81d`
- Если заказа с запрошенным guid не существует, будет создан новый заказ и его табличная часть будет заполнена строками, сформированными на основании тела post-запроса
- Если заказ с guid запроса существует, но изделия этого заказа еще не включены в задание на производство, заказ будет перезаполнен
- Если заказ с guid запроса существует и уже запущен в работу, заказ перезаполнен не будет

В теле запроса необходимо передать следующую структуру:
- `ref` - строка(36) - дублирует guid заказа из url запроса. Идентификаторы клиент генерирует самостоятельно, они должны быть уникальными и соответствовать маске guid. В случае интегарции с 1С, проще всего, в качестве guid заказов использовать ссылки _Заказов поставщику_ - тогда заказы в сервисе и заказы в учетной системе окажутся сопоставленными один к одному
- `number_doc` - строка(11) - номер документа в учетной системе клиента - вспомогательные данные, не участвуют в расчетах
- `date` - строка даты документа в формате ISO - вспомогательные данные, не участвуют в расчетах
- `delivery_date` - строка желаемой даты доставки в формате ISO - вспомогательные данные, могут использоватья при планировании производства
- `delivery_order` - число - номер партии доставки - вспомогательные данные, могут использоватья при планировании производства
- `delivery_time` - строка планового времени доставки партии в формате ISO - вспомогательные данные, могут использоватья при планировании производства
- `obj_delivery_state` - необязательный параметр типа строка. Если указать в этом поле "Отозван", то заказ вернётся в состояние `Отозван`, если изделия текущего заказа еще не включены в задание на производство. Любое другое значение в поле `obj_delivery_state`, формирует заказ в статусе `Отправлен`
- `partner` - строка(36) - guid контрагента - имеет смысл, если у клиента есть несколько договоров с производителем от разных юрлиц. Если заказы всегда делаются от одного юрлица, поле можно не заполнять
- `production` - массив объектов - табличная часть заказа
  + `nom` - строка(36) - guid вставки, если заказывается продукция (подоконники, откосы, москитки, стеклопакеты) или guid номенклатуры, если заказывается товар (заглушки и прочие штучные комплектующие)
  + `clr` - строка(36) - guid цвета - для материалов можно не указывать
  + `len` - число - длина изделия
  + `height` - число - ширина или высота изделия
  + `quantity` - число - количество заказываемых изделий или единиц товара
  + `note` - строка - произвольная дополнителная информация о строке заказа (штрихкод, маркировка, индивидуальные даты и т.д.)

Если при обработке запроса произошли ошибки, сервис вернёт http статус, отличный от 200 и описание ошибки в теле ответа

В штатном режиме при отсутствии ошибок авторизации и обработки, сервис вернёт http статус 200, а в теле ответа разместит структуру сформированного заказа с ценами:
- `ref` - строка(36) - guid заказа
- `class_name` - строка - имя типа класса данных _doc.calc_order_
- `date` - строка даты документа в формате ISO
- `number_doc` - строка(11) - номер документа
- `organization` - строка(36) - guid организации производителя
- `department` - строка(36) - guid подразделения производителя
- `partner` - строка(36) - guid контрагента
- `contract` - строка(36) - guid договора
- `vat_consider` - булево - признак _учитывать ндс_
- `vat_included` - булево - признак _сумма включает ндс_
- `manager` - строка(36) - guid пользователя, ассоциированного с учетной записью клиента
- `obj_delivery_state` - строка - статус заказа
- `doc_amount` - число - сумма документа в валюте договора
- `amount_operation` - число - сумма документа в валюте упр. учета
- `production` - массив объектов - табличная часть заказа
  + `row` - число - номер строки табчасти
  + `nom` - строка(36) - guid номенклатуры
  + `clr` - строка(36) - guid цвета
  + `len` - число - длина изделия
  + `width` - число - ширина или высота изделия
  + `s` - число - площадь изделия
  + `qty` - число - количество штук товара или продукции
  + `quantity` - число - количество в единицах хранения остатков (продукция всегда числится в шиуках)
  + `price` - число - цена
  + `amount` - число - сумма
  + `vat_rate` - строка - ставка ндс
  + `vat_amount` - число - сумма ндс
  + `note` - строка - произвольная дополнителная информация о строке заказа

#### Дополнительно (calc_order)
endpoint `POST /prm/doc.calc_order/:ref`, поддерживает параметр `action` в теле запроса. Если параметр не задан или имеет значение `prm`, работает описанный выше ↑ алгоритм. Доступны следующие варианты `action`

#### recalc
Выполняет пересчёт заказа на сервере. Применяет актуальные на момент пересчёта настройки технологических справочников и правил ценообразования

Пример тела POST-запроса: `{"action":"recalc"}`

В тело запроса можно подмешать значения реквизитов шапки заказа и/или массивы табличных частей. Заказ в этом случае, будет перезаполнен и пересчитан. Примеры:
````javascript
// Замена организации заказа.
// В этом случае, стандартный отбработчик заменит и договор для пары контрагент-организация
{
    "action": "recalc",
    "organization": ""
}

// Замена комментария и внутреннего номера
{
  "action": "recalc",
  "number_internal": "220-330"
  "note": "новый комментарий к старому заказу"
}

// Замена дополнительных реквизитов (табчасть заменяется полностью, после пересчёта останется две строки)
{
  "action": "recalc",
  "extra_fields": [
    {
      "property": "6d9d9a62-9d4d-11ed-9cb5-dac91ac36046", // скидка на заказ
      "value": 25
    },
    {
      "property": "59468a92-9d4d-11ed-9cb5-dac91ac36046", // наценка на заказ
      "value": 23
    }
  ]
}

// Замена строк продукции (табчасть заменяется полностью, реквизиты строк `price`, `price_internal`,
// `marginality`, `amount`, `amount_internal`, `vat_amount`, `first_cost`, `margin` - можно не указывать,
// они будут перезаполнены при пересчёте спецификацй и цен изделий заказа)
{
  "action": "recalc",
  "production": [
    {
      "uid": "6a43a570-b06f-11ed-bce8-83dcbc23069e",
      "nom": "67fd2c22-280a-11eb-9aed-83771e195a46",
      "unit": "67fd2c23-280a-11eb-9aed-83771e195a46",
      "characteristic": "69ad7ff0-b06f-11ed-bce8-83dcbc23069e",
      "quantity": 1,
      "extra_charge_external": 0,
      "discount_percent": 0,
      "discount_percent_internal": 30
    },
    {
      "uid": "79669da0-b06f-11ed-bce8-83dcbc23069e",
      "nom": "fbd744b4-85c9-11ec-9981-e64cf8971646",
      "unit": "fbd744b5-85c9-11ec-9981-e64cf8971646",
      "characteristic": "791410d0-b06f-11ed-bce8-83dcbc23069e",
      "quantity": 1,
      "extra_charge_external": 0,
      "discount_percent": 0,
      "discount_percent_internal": 20
    }
  ]
}
````

#### rm_rows
Удаляет из заказа одну или несколько строк и выполняет пересчёт

Пример тела POST-запроса: `{"action":"rm_rows", "rows":[1,7]}` - удалит первую и седьмую строки.
Вместо номеров строк, можно указать их уникальные идентификаторы `{"action":"rm_rows", "rows":["de523fd0-9337-11ed-95f7-addfb1d82d4c"]}`, отработает аналогично

Ответ аналогичен методу `recalc`

### GET /prm/doc.calc_order/:ref
Например, `get https://crystallit.oknosoft.ru/prm/doc.calc_order/54429bcc-475a-11e7-956f-9cb654bba81d`
- Если заказа с guid `54429bcc-475a-11e7-956f-9cb654bba81d` не существует, сервис вернёт http статус 404 и описание ошибки
- Если заказ найден и нет проблем с авторизацией, сервис вернёт структуру заказа, аналогичную возвращаемой методом POST

### GET /prm/cat
Например, `get https://crystallit.oknosoft.ru/prm/cat`, вернёт объект с данными следующих справочников:
- `clrs` - цвета
- `inserts` - вставки
- `nom` - номенклатура
- `partners` - контрагенты
- `users` - пользователи

Эту информацию можно использовать для настройки таблиц соответствия справочников учетной системы клиента данным производителя.

### POST /prm/delivery/delivery
Например, `post https://crystallit.oknosoft.ru/prm/delivery/delivery`

Ожидает в теле запроса массив структур со ссылками заказов, датами и номерами партий доставки.
Перезаполняет допреквизиты заказа, относящиеся к доставке, в том числе, в уже запущенных в работу заказах.
Элементы массива должны содержать ссылку и одно или несколько дополнительных свойств:
- `ref` - строка(36) - guid существующего в системе заказа
- `date` - строка плановой даты доставки в формате ISO
- `time` - строка планового времени доставки в формате ISO
- `order` - строка номера партии доставки, используется для сортировки

### POST /prm/store/:ref
Например, `post https://crystallit.oknosoft.ru/prm/store/mapping`

Сохраняет в сервисе произвольный объект пользователя по ключу, указанному в параметре `ref`.
Например, таблицу соответствия идентификаторов номенклатур, цветов и вставок.
Массив структур нужно передать в теле запроса.

### GET /prm/store/:ref
Например `get https://crystallit.oknosoft.ru/prm/store/mapping`

Возвращает сохранённый пользователем произвольный объект

### GET /prm/log/:date
Например `get https://crystallit.oknosoft.ru/prm/log/20170923`

Возвращает таблицу запросов и ответов сервиса за 23 сентября 2017 года для зоны авторизованного пользователя

### POST /prm/docs
Например, `post https://crystallit.oknosoft.ru/prm/docs`

#### Получение документов по произвольному фильтру
Возвращает произвольные документы из сервиса с фильтром. Фильтр задается в теле запроса в [формате mango query](https://pouchdb.com/guides/mango-queries.html).
Тело запроса должно быть объектом, содержащим минимум один ключ - `selector`, а внутри него обязательно должен быть указан класс объектов с ключом `class_name`, например `doc.selling` (это документы реализации).
Также в состав ключа `selector` рекомендуется включать фильтр по дате - `date`, например `'date':{'$gt':'20180101'}`.
Третьим рекомендуемым ключом селектора является `search` - это поле поиска по заказам, например номеру и комментарию.

Кроме `selector`, можно указать, например, `fields` - поля, которые вернутся в ответе сервиса. Если состав необходимых полей при разработке не известен, то `fields` можно оставить пустым - вернутся все поля.

В ответе сервиса выполняется расчет представления для полей ссылочного типа, если ссылки кешируются в `ram` (т.е. в ОЗУ, например номенклатура, вставки, цвета и т.д.). В этом случае реквизит объекта будет не уникальным идентификатором, а объектом, содержащим уникальный идентификатор, наименование и код для справочника, или номер и дату для документа.

#### Получение документов по массиву идентификаторов
Для получения документов определенного класса по перечню идентификаторов нужно добавить в `selector` свойство `class_name` с именем класса (например, `cat.characteristics`) и свойство `_id`, в значение которого положить массив идентификаторов. Идентификаторы нужны 36-символьные, т.е. не склеенные с именем класса (склеенные - это вроде `cat.characteristics|_id`).

Объекты вернутся целиком, как есть, со всеми полями.


### GET /prm/:class_name/:ref
Например, `get https://crystallit.oknosoft.ru/prm/doc.selling/54429bcc-475a-11e7-956f-9cb654bba81d`

Возвращает объект указанного класса (`class_name`) с идентификатором `ref`.

### GET /prm/cch.properties/:ref
Например, `get https://alutech2.oknosoft.ru/prm/cch.properties/0281ac3c-71d5-11eb-946f-b01789154146`

Возвращает описание параметра со связями параметров и доступными значениями.

В http-заголовках headers, можно указать в поле `branch`, идентификатор отдела абонента, в контексте которого требуется рассчитать связи параметров.

Если для параметра не предусмотрены связи и типом значений параметра, является справочник `Значения свойств объектов`, в массив доступных, будут добавлены все элементы, подчинённые текущему параметру.

Если для параметра не предусмотрены связи и тип значений отличается от `Значения свойств объектов` (например, `Номенклатура` или `Цвета`), массив доступных значений не заполняется, чтобы не гонять по сети потенциальные десятки тысяч объектов, список которых можно получить другим способом (например, запросом `GET /prm/cat`)



## Переменные окружения

Для настройки параметров сервиса, на стороне сервера используются следующие переменные среды:

- `COUCHLOCAL` - адрес с префиксом приложения, по которому сервис обращается к CouchDB
- `ZONE` - область данных абонента сервиса
- `DBUSER` - имя пользователя, с которым сервис авторизуется в CouchDB
- `DBPWD` - пароль служебного пользователя
- `DEBUG` - параметры логирования работы сервиса, подробнее см.: [debug](https://github.com/visionmedia/debug/blob/master/README.md)
- `PORT` - порт, на котором служба будет слушать запросы (по умолчанию - 3000)
