/**
 * Question pool for Verdikt.
 * Each question carries text in EN/IT/ES and 1–3 tags.
 * Tags drive the personality/statistics calculations at game end.
 */

/** @type {import('../types').RankingQuestion[]} */
const rankingQuestions = [
  {
    id: 'r1',
    text: {
      en: 'Money is the key to happiness.',
      it: 'Il denaro è la chiave della felicità.',
      es: 'El dinero es la clave de la felicidad.',
    },
    tags: [
      { name: 'pragmatic', direction: 'agree' },
      { name: 'idealist', direction: 'disagree' },
    ],
  },
  {
    id: 'r2',
    text: {
      en: 'I would rather have a few deep friendships than many casual ones.',
      it: 'Preferisco avere poche amicizie profonde che molte superficiali.',
      es: 'Prefiero tener pocas amistades profundas que muchas casuales.',
    },
    tags: [
      { name: 'loyal', direction: 'agree' },
      { name: 'social', direction: 'disagree' },
    ],
  },
  {
    id: 'r3',
    text: {
      en: 'Rules exist to be broken when necessary.',
      it: 'Le regole esistono per essere infrante quando necessario.',
      es: 'Las reglas existen para romperse cuando es necesario.',
    },
    tags: [
      { name: 'adventurous', direction: 'agree' },
      { name: 'cautious', direction: 'disagree' },
    ],
  },
  {
    id: 'r4',
    text: {
      en: 'I believe things generally work out for the best.',
      it: 'Credo che le cose generalmente si risolvano per il meglio.',
      es: 'Creo que las cosas generalmente resultan para bien.',
    },
    tags: [
      { name: 'optimistic', direction: 'agree' },
      { name: 'realist', direction: 'disagree' },
    ],
  },
  {
    id: 'r5',
    text: {
      en: 'I often put other people\'s needs before my own.',
      it: 'Spesso metto i bisogni degli altri davanti ai miei.',
      es: 'A menudo pongo las necesidades de los demás antes que las mías.',
    },
    tags: [
      { name: 'empathetic', direction: 'agree' },
      { name: 'ambitious', direction: 'disagree' },
    ],
  },
  {
    id: 'r6',
    text: {
      en: 'I prefer to plan everything in advance rather than be spontaneous.',
      it: 'Preferisco pianificare tutto in anticipo piuttosto che essere spontaneo.',
      es: 'Prefiero planificar todo con anticipación antes que ser espontáneo.',
    },
    tags: [
      { name: 'analytical', direction: 'agree' },
      { name: 'adventurous', direction: 'disagree' },
    ],
  },
  {
    id: 'r7',
    text: {
      en: 'Love is more important than career success.',
      it: 'L\'amore è più importante del successo professionale.',
      es: 'El amor es más importante que el éxito profesional.',
    },
    tags: [
      { name: 'romantic', direction: 'agree' },
      { name: 'ambitious', direction: 'disagree' },
    ],
  },
  {
    id: 'r8',
    text: {
      en: 'I find it easy to talk to strangers.',
      it: 'Trovo facile parlare con gli sconosciuti.',
      es: 'Me resulta fácil hablar con extraños.',
    },
    tags: [
      { name: 'charismatic', direction: 'agree' },
      { name: 'social', direction: 'agree' },
    ],
  },
  {
    id: 'r9',
    text: {
      en: 'I think about the future more than the present.',
      it: 'Penso al futuro più che al presente.',
      es: 'Pienso más en el futuro que en el presente.',
    },
    tags: [
      { name: 'ambitious', direction: 'agree' },
      { name: 'optimistic', direction: 'agree' },
    ],
  },
  {
    id: 'r10',
    text: {
      en: 'I believe creativity is more valuable than discipline.',
      it: 'Credo che la creatività sia più preziosa della disciplina.',
      es: 'Creo que la creatividad es más valiosa que la disciplina.',
    },
    tags: [
      { name: 'creative', direction: 'agree' },
      { name: 'analytical', direction: 'disagree' },
    ],
  },
  {
    id: 'r11',
    text: {
      en: 'A person\'s past defines who they are today.',
      it: 'Il passato di una persona definisce chi è oggi.',
      es: 'El pasado de una persona define quién es hoy.',
    },
    tags: [
      { name: 'realist', direction: 'agree' },
      { name: 'optimistic', direction: 'disagree' },
    ],
  },
  {
    id: 'r12',
    text: {
      en: 'I would rather take a risk and fail than play it safe.',
      it: 'Preferisco rischiare e fallire che stare al sicuro.',
      es: 'Prefiero arriesgarme y fallar que jugar sobre seguro.',
    },
    tags: [
      { name: 'adventurous', direction: 'agree' },
      { name: 'resilient', direction: 'agree' },
      { name: 'cautious', direction: 'disagree' },
    ],
  },
];

/** @type {import('../types').VoteQuestion[]} */
const voteQuestions = [
  {
    id: 'v1',
    text: {
      en: 'Who would survive longest in the wilderness?',
      it: 'Chi sopravvivrebbe più a lungo nella natura selvaggia?',
      es: '¿Quién sobreviviría más tiempo en la naturaleza?',
    },
    tags: [
      { name: 'resilient', direction: 'agree' },
      { name: 'adventurous', direction: 'agree' },
    ],
  },
  {
    id: 'v2',
    text: {
      en: 'Who would most likely become famous?',
      it: 'Chi ha più probabilità di diventare famoso?',
      es: '¿Quién tiene más probabilidades de hacerse famoso?',
    },
    tags: [
      { name: 'charismatic', direction: 'agree' },
      { name: 'ambitious', direction: 'agree' },
    ],
  },
  {
    id: 'v3',
    text: {
      en: 'Who would be the best person to call at 3am with a problem?',
      it: 'Chi sarebbe la persona migliore da chiamare alle 3 di notte con un problema?',
      es: '¿A quién llamarías a las 3am con un problema?',
    },
    tags: [
      { name: 'empathetic', direction: 'agree' },
      { name: 'loyal', direction: 'agree' },
    ],
  },
  {
    id: 'v4',
    text: {
      en: 'Who would be the best leader in a zombie apocalypse?',
      it: 'Chi sarebbe il miglior leader in un\'apocalisse zombie?',
      es: '¿Quién sería el mejor líder en un apocalipsis zombie?',
    },
    tags: [
      { name: 'charismatic', direction: 'agree' },
      { name: 'resilient', direction: 'agree' },
    ],
  },
  {
    id: 'v5',
    text: {
      en: 'Who is most likely to go on a spontaneous trip tomorrow?',
      it: 'Chi è più probabile che parta per un viaggio spontaneo domani?',
      es: '¿Quién tiene más probabilidades de hacer un viaje espontáneo mañana?',
    },
    tags: [
      { name: 'adventurous', direction: 'agree' },
      { name: 'creative', direction: 'agree' },
    ],
  },
  {
    id: 'v6',
    text: {
      en: 'Who would win a debate about literally anything?',
      it: 'Chi vincerebbe un dibattito su qualsiasi cosa?',
      es: '¿Quién ganaría un debate sobre cualquier cosa?',
    },
    tags: [
      { name: 'analytical', direction: 'agree' },
      { name: 'charismatic', direction: 'agree' },
    ],
  },
  {
    id: 'v7',
    text: {
      en: 'Who would be most likely to start their own business?',
      it: 'Chi sarebbe più propenso ad avviare la propria attività?',
      es: '¿Quién tendría más probabilidades de iniciar su propio negocio?',
    },
    tags: [
      { name: 'ambitious', direction: 'agree' },
      { name: 'pragmatic', direction: 'agree' },
    ],
  },
  {
    id: 'v8',
    text: {
      en: 'Who would give the best advice about a broken heart?',
      it: 'Chi darebbe il miglior consiglio per un cuore spezzato?',
      es: '¿Quién daría el mejor consejo para un corazón roto?',
    },
    tags: [
      { name: 'empathetic', direction: 'agree' },
      { name: 'romantic', direction: 'agree' },
    ],
  },
];

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = { rankingQuestions, voteQuestions, shuffle };
