// Catálogo da loja. Para adicionar um item: coloque a foto em public/img/<img>.jpg e inclua uma linha em items.
// id: só letras minúsculas, números e hífen. price e cond são os valores iniciais (o modo vendedor pode mudar depois).
window.CATALOG = {
  groups: [
    {"id":"csm","name":"Chainsaw Man","sub":"Tatsuki Fujimoto · Panini · volumes 1 ao 9","banner":"csm_stack","lot":true},
    {"id":"aot","name":"Ataque dos Titãs","sub":"Hajime Isayama · Panini · volumes avulsos da edição simples","banner":"aot_stack","lot":true},
    {"id":"outros","name":"Livros e jogo","sub":"Alta Life · Paidós · Paralela · Galápagos","lot":false}
  ],
  items: [
    {"id":"csm1","group":"csm","title":"Chainsaw Man","vol":1,"img":"csm1","price":25,"cond":"Bem conservado"},
    {"id":"csm2","group":"csm","title":"Chainsaw Man","vol":2,"img":"csm2","price":25,"cond":"Bem conservado"},
    {"id":"csm3","group":"csm","title":"Chainsaw Man","vol":3,"img":"csm3","price":25,"cond":"Bem conservado"},
    {"id":"csm4","group":"csm","title":"Chainsaw Man","vol":4,"img":"csm4","price":25,"cond":"Bem conservado"},
    {"id":"csm5","group":"csm","title":"Chainsaw Man","vol":5,"img":"csm5","price":25,"cond":"Bem conservado"},
    {"id":"csm6","group":"csm","title":"Chainsaw Man","vol":6,"img":"csm6","price":25,"cond":"Bem conservado"},
    {"id":"csm7","group":"csm","title":"Chainsaw Man","vol":7,"img":"csm7","price":25,"cond":"Bem conservado"},
    {"id":"csm8","group":"csm","title":"Chainsaw Man","vol":8,"img":"csm8","price":25,"cond":"Bem conservado"},
    {"id":"csm9","group":"csm","title":"Chainsaw Man","vol":9,"img":"csm9","price":25,"cond":"Bem conservado"},
    {"id":"aot2","group":"aot","title":"Ataque dos Titãs","vol":2,"img":"aot2","price":18,"cond":"Bem conservado"},
    {"id":"aot5","group":"aot","title":"Ataque dos Titãs","vol":5,"img":"aot5","price":18,"cond":"Bem conservado"},
    {"id":"aot8","group":"aot","title":"Ataque dos Titãs","vol":8,"img":"aot8","price":18,"cond":"Bem conservado"},
    {"id":"aot26","group":"aot","title":"Ataque dos Titãs","vol":26,"img":"aot26","price":18,"cond":"Bem conservado"},
    {"id":"aot30","group":"aot","title":"Ataque dos Titãs","vol":30,"img":"aot30","price":12,"cond":"Com marcas de uso"},
    {"id":"aot33","group":"aot","title":"Ataque dos Titãs","vol":33,"img":"aot33","price":18,"cond":"Bem conservado"},
    {"id":"habitos","group":"outros","title":"Hábitos Atômicos, de James Clear","img":"habitos","price":28,"cond":"Bem conservado"},
    {"id":"anasuy","group":"outros","title":"A gente mira no amor e acerta na solidão, de Ana Suy","img":"anasuy","price":25,"cond":"Bem conservado"},
    {"id":"evelyn","group":"outros","title":"Os sete maridos de Evelyn Hugo, de Taylor Jenkins Reid","img":"evelyn","price":28,"cond":"Bem conservado"},
    {"id":"black","group":"outros","title":"Black Stories: Mistério (jogo de cartas)","img":"black","price":35,"cond":"Bem conservado"}
  ]
};
