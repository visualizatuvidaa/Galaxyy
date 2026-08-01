export interface StoryScene {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  lines: string[];
}

export const STORY_SCENES: Record<string, StoryScene> = {
  'intro-world-1': {
    key: 'intro-world-1',
    title: 'Galaxy Strike Legacy',
    subtitle: 'Prologo: La transmisión desaparece',
    accent: '#00f7ff',
    lines: [
      'La última señal de la estación Helios se corta en pleno horizonte.',
      'La noche del cosmos se abre sobre una promesa rota: una civilización fue absorbida por un pulso oscuro.',
      'Tu nave, la Viper Prime, despierta como único rastro de memoria y voluntad.',
      'En cada mundo que atraviesas, la verdad del Dominion vuelve a reclamar su lugar en el cielo.',
    ],
  },
  'ending-world-1': {
    key: 'ending-world-1',
    title: 'Helios Verge',
    subtitle: 'Desenlace: la primera grieta',
    accent: '#00f7ff',
    lines: [
      'Aegis Dread cae, pero su casco no se rompe: solo se abre una puerta.',
      'Entre el humo y la estela, aparece un mapa encriptado del Dominio.',
      'La frontera ya no es un límite: es un camino que empezó a girar en tu dirección.',
    ],
  },
  'intro-world-2': {
    key: 'intro-world-2',
    title: 'Pyra Rift',
    subtitle: 'La llama del mundo dos',
    accent: '#ff5f6d',
    lines: [
      'Más allá del primer hueco, la Nebulosa Pyra respira con fuego mal controlado.',
      'Los restos de una flota vieja se convierten en centinelas de lava y ruido.',
      'Tu misión ya no es solo sobrevivir: es llegar al centro de la herida antes de que se cierre.',
    ],
  },
  'ending-world-2': {
    key: 'ending-world-2',
    title: 'Pyra Rift',
    subtitle: 'Desenlace: el fuego tiene memoria',
    accent: '#ff5f6d',
    lines: [
      'Magma Warden se derrumba junto a una memoria de empuje térmico.',
      'La señal que emerge de su núcleo no pertenece a un bastión: pertenece a una voz perdida.',
      'Por primera vez, el dominio anda a tu paso.',
    ],
  },
  'intro-world-3': {
    key: 'intro-world-3',
    title: 'Ion Tomb',
    subtitle: 'La tumba eléctrica',
    accent: '#70f0ff',
    lines: [
      'El vacío se llena de corrientes vivas, y cada destello parece una sentencia.',
      'En el Ion Tomb hay un ecosistema de silencio con electricidad atrapada.',
      'Cuando una tormenta se centra en tu casco, todo lo que quedaba de la verdad empieza a vibrar.',
    ],
  },
  'ending-world-3': {
    key: 'ending-world-3',
    title: 'Ion Tomb',
    subtitle: 'Desenlace: el eco se vuelve humano',
    accent: '#70f0ff',
    lines: [
      'Ion Echo cae entre chispas de memoria y un murmullo de antiguos pilotos.',
      'Un nombre aparece en la tormenta: “Astra”.',
      'La historia deja de ser un conflicto abstracto y se convierte en una búsqueda personal.',
    ],
  },
  'intro-world-4': {
    key: 'intro-world-4',
    title: 'Abyss Circuit',
    subtitle: 'La red del abismo',
    accent: '#8b5cf6',
    lines: [
      'En Abyss Circuit, las sombras no son huecos: son enjambres de decisiones sin resolver.',
      'Los antiguos cables se han convertido en nervios de una máquina sin origen.',
      'Al entrar en la corte de Null Conductor, todo se vuelve una sola pregunta: ¿quién la programó?',
    ],
  },
  'ending-world-4': {
    key: 'ending-world-4',
    title: 'Abyss Circuit',
    subtitle: 'Desenlace: la red habla',
    accent: '#8b5cf6',
    lines: [
      'Null Conductor se desploma al tiempo que su red se quiebra en fragmentos.',
      'Su recuerdo final refleja una flota entera que eligió el olvido para sobrevivir.',
      'La verdad se vuelve más difícil: el Dominion no elimina, expande.',
    ],
  },
  'intro-world-5': {
    key: 'intro-world-5',
    title: 'Tempest Gate',
    subtitle: 'Puerta de huracanes',
    accent: '#38bdf8',
    lines: [
      'La Tempest Gate no ofrece refugio: ofrece fuerza sin tregua.',
      'Cada ráfaga empuja la nave hacia su propio límite, mientras el cielo se desintegra.',
      'Detrás del vendaval aparece la huella del primer comandante que logró cerrar el Dominio.',
    ],
  },
  'ending-world-5': {
    key: 'ending-world-5',
    title: 'Tempest Gate',
    subtitle: 'Desenlace: la puerta se abre',
    accent: '#38bdf8',
    lines: [
      'Storm Titan se hunde en su propia tempestad y deja abrir su interior.',
      'Dentro no hay un arma: hay una promesa de reencarnación del caos.',
      'La frontera se plasma como una llave.',
    ],
  },
  'intro-world-6': {
    key: 'intro-world-6',
    title: 'Obsidian Crown',
    subtitle: 'Corona de ceniza',
    accent: '#f97316',
    lines: [
      'Obsidian Crown está silencioso justo antes del colapso.',
      'El espacio se ha endurecido en una muralla sólida de metal y sangre estelar.',
      'Un soberano de obsidiana vigila desde el centro y observa cada maniobra tuya.',
    ],
  },
  'ending-world-6': {
    key: 'ending-world-6',
    title: 'Obsidian Crown',
    subtitle: 'Desenlace: la ceniza se vuelve memoria',
    accent: '#f97316',
    lines: [
      'Obsidian King cae y deja caer el gran secreto de los dominios menores.',
      'No había ejércitos: había una estructura de control que se alimentaba del miedo colectivo.',
      'La memoria del cosmos vuelve a ti como una herida que ya no es ajena.',
    ],
  },
  'intro-world-7': {
    key: 'intro-world-7',
    title: 'Aurora Prime',
    subtitle: 'Aurora en contra de la noche',
    accent: '#34d399',
    lines: [
      'La aurora de Aurora Prime ya no ilumina: se convierte en una cúpula de persecución.',
      'Cada destello de luz es una advertencia y un recuerdo de los que se quedaron atrás.',
      'La voz que te sigue no es del enemigo; es la huella de la primera nave que rompió el ciclo.',
    ],
  },
  'ending-world-7': {
    key: 'ending-world-7',
    title: 'Aurora Prime',
    subtitle: 'Desenlace: la trampa del amanecer',
    accent: '#34d399',
    lines: [
      'Aurora Wraith cae y la aurora se vuelve un espejo.',
      'En esa reflexión aparece una segunda realidad: un orden de guardianes que eligió silencio.',
      'La historia ya no se trata de “luchar”: se trata de decidir qué conservar.',
    ],
  },
  'intro-world-8': {
    key: 'intro-world-8',
    title: 'Black Halo',
    subtitle: 'Anillo negro',
    accent: '#d946ef',
    lines: [
      'Black Halo gira con la exactitud de una sentencia sin reprieve.',
      'Cada órbita te lanza al borde del colapso para obligarte a elegir tu velocidad.',
      'El guardián del anillo ya sabe tu nombre, aunque aún no sepas qué esconde.',
    ],
  },
  'ending-world-8': {
    key: 'ending-world-8',
    title: 'Black Halo',
    subtitle: 'Desenlace: el anillo queda hueco',
    accent: '#d946ef',
    lines: [
      'Halo Reaver muere dejando atrás un anillo de energía colapsada.',
      'El vacío del anillo ya no se siente como una prisión: se siente como un camino.',
      'La historia del Dominion empieza a tener una salida.',
    ],
  },
  'intro-world-9': {
    key: 'intro-world-9',
    title: 'Eclipse Core',
    subtitle: 'El núcleo eclipsado',
    accent: '#fb7185',
    lines: [
      'Eclipse Core es una ciudad sin sol y sin retorno.',
      'Todo el sector se convierte en fuego de repletamiento: una danza brutal sin lugar para el miedo.',
      'Allí, el último escudo del Dominion se sostiene solo por una voluntad empeñada en no caer.',
    ],
  },
  'ending-world-9': {
    key: 'ending-world-9',
    title: 'Eclipse Core',
    subtitle: 'Desenlace: la noche de la voluntad',
    accent: '#fb7185',
    lines: [
      'Eclipse Sovereign cae, pero su sombra persiste en un pulso que aún late.',
      'La máquina final ya no es una fortaleza: es una consecuencia.',
      'Y esa consecuencia apunta directamente al ultimo mundo.',
    ],
  },
  'intro-world-10': {
    key: 'intro-world-10',
    title: 'Astral Dominion',
    subtitle: 'Último bastión',
    accent: '#a855f7',
    lines: [
      'Astral Dominion no parece una frontera: parece el último corazón del universo.',
      'Aquí se concentran las piezas de la historia, las promesas y las fallas.',
      'El Dominion Core no es un enemigo: es la herida que se volvió reino.',
      'Si lo destruyes, la noche dejará de ser una leyenda y volverá a ser un futuro.',
    ],
  },
  'ending-world-10': {
    key: 'ending-world-10',
    title: 'Astral Dominion',
    subtitle: 'Final: el reino que renace',
    accent: '#a855f7',
    lines: [
      'Dominion Core pierde su forma y el cosmos se queda en silencio por primera vez.',
      'No hay triunfo sin costumbre, ni victoria sin memoria; solo la certidumbre de que una nueva ruta existe.',
      'La Viper Prime no sale victoriosa del cielo: sale con un mapa de regreso al principio.',
    ],
  },
};

export const getStoryScene = (key: string) => STORY_SCENES[key] ?? null;
