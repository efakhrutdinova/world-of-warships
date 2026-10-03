/**
 * Sliced from a real vortex response (see scripts/fetch-data.ts), then extended
 * with one record that carries no type tag, which normalization must drop.
 */
import type { CompactBundle } from '@/types/vortex'

export const catalogFixture: CompactBundle = {
  generatedAt: '2026-10-02T09:00:00.000Z',
  locale: 'en',
  mediaPath: 'https://wows-gloss-icons.wgcdn.co/icons/',
  vehicles: {
    '3331208656': {
      level: 9,
      name: 'PRSD919_Azur_Tashkent',
      nation: 'ussr',
      tags: [
        'Destroyer',
        'special',
        'uiPremium',
        'canRent',
        'sellable',
        'catalogueHiddenIfMissing',
        'azur',
      ],
      icons: {
        small:
          'vehicle/small/PRSD919_4aa90db10848c9cfeab499462f027eadc4bcb813f6b7cd3ef6ec1393f9be6a0f.png',
        medium:
          'vehicle/medium/PRSD919_19ce1dff9fc6b35aa1ff4fe387ab222f4fbc0c5b16e0e5ac8530f20e27ae98dd.png',
        contour:
          'vehicle/contour/PRSD919_eac7e9f767273d711e3ece8d9260796a857f10f879d1fc257383650e6e176fe3.png',
      },
      title: 'AL Tashkent',
    },
    '3248404240': {
      level: 8,
      name: 'PHSC998_Statenland',
      nation: 'netherlands',
      tags: ['Cruiser', 'demoWithoutStatsPrem', 'uiSpecial', 'canRent', 'catalogueHidden'],
      icons: {
        small:
          'vehicle/small/PHSC998_b0d4cb96ffeaf9151e63cfc056aaf2fee6616556d2b5a5e098123d72e3255782.png',
        medium:
          'vehicle/medium/PHSC998_efab7e4f57d7e42d538ce7d63404e290da637f096824e6ba8828d648e4ae7a48.png',
        contour:
          'vehicle/contour/PHSC998_e4ac5eab3578438bdec5380500229b7a298ef876c21016f8ba1715da830ff07a.png',
      },
      title: 'Statenland',
    },
    '4178457808': {
      level: 11,
      name: 'PZSD111_Kunming',
      nation: 'pan_asia',
      tags: ['Destroyer', 'superShip', 'canRent', 'sellable', 'buyable'],
      icons: {
        small:
          'vehicle/small/PZSD111_be5244c3c226a0d26577f75ed195174db6d4a0d9a3c0a43edee2899c40229327.png',
        medium:
          'vehicle/medium/PZSD111_480f23ece041c029bd801bb4b6162da5cb71d05586b1a339d36f53d746e7b13a.png',
        contour:
          'vehicle/contour/PZSD111_54253612e42ac7ec67bcdcdc789b2aca7e0dccf83f78d9a262e92bcd6072d2aa.png',
      },
      title: 'Kunming',
    },
    '3969857328': {
      level: 10,
      name: 'PGSB310_Preussen',
      nation: 'germany',
      tags: ['Battleship', 'upgradeable', 'sellable', 'buyable'],
      icons: {
        small:
          'vehicle/small/PGSB310_f5813760206640919db7efb0b53f125d386342be305fd14c383d8be8876f23c2.png',
        medium:
          'vehicle/medium/PGSB310_4c9ec61e324c9fe523e97ff54fc6532f0dbfd19a6c36217a6b2b869d2260550b.png',
        contour:
          'vehicle/contour/PGSB310_3d16fc9cf3099d7c5982880ef684bb121383b1d291f3f5f6153cd15877bba5bb.png',
      },
      title: 'Preussen',
    },
    '3340154864': {
      level: 10,
      name: 'PASS910_Balao_2',
      nation: 'usa',
      tags: ['Submarine', 'demoWithoutStatsPrem', 'uiSpecial', 'canRent', 'catalogueHidden'],
      icons: {
        small:
          'vehicle/small/PASS910_fe258ca6b0560b568ef7f2fcc3235a4e33f126a36e3375656d5590cfc1d62041.png',
        medium:
          'vehicle/medium/PASS910_7c94e8ef5186fc7eddceed98ec6829649c4f60e5cd6702c209a7f53bd20da39b.png',
        contour:
          'vehicle/contour/PASS910_c12f7a39518a2e0296eb6a5b0c0e2679f6004b58cd1d53996f5287453d58f9e6.png',
      },
      title: 'Balao 2',
    },
    '999999999': {
      level: 5,
      name: 'PXXX_NoType',
      nation: 'usa',
      tags: ['sellable', 'canRent'],
      icons: {
        small: 'vehicle/small/x.png',
      },
      title: 'No Type',
    },
  },
  nations: [
    {
      name: 'ussr',
      id: 0,
      color: 14764062,
      icons: {
        tiny: 'nation_flags/tiny/flag_Russia_1113e2d5311f815f1da7b80ea227d7ce57db3e1f476690cdcfc949011ff69283.png',
        small:
          'nation_flags/small/flag_Russia_2096a97e46c74332d0579c54e5a242a2ff4a184d227ca50a36cba5f0875d7e48.png',
        large:
          'nation_flags/large/flag_Russia_a23dac134108e86530943971aed79d13fb6eab45748b539826c3538662bfe5d1.png',
      },
      title: 'U.S.S.R.',
    },
    {
      name: 'japan',
      id: 1,
      color: 13752795,
      icons: {
        tiny: 'nation_flags/tiny/flag_Japan_afff8f2e1e23cdf6b9314f80cca4fb85af40cfbe7812a9ccc707fd24ed207557.png',
        small:
          'nation_flags/small/flag_Japan_e342ec07b9df580383a85abc178ac050901763e92607376b50a093c02b3abed0.png',
        large:
          'nation_flags/large/flag_Japan_dc7a62826070d782f60b959d0b00fa9548d97a3893f08824d2e2dece8df3ce78.png',
      },
      title: 'Japan',
    },
    {
      name: 'usa',
      id: 2,
      color: 5549009,
      icons: {
        tiny: 'nation_flags/tiny/flag_USA_a608afcc194232095536ebc93508eb7b4b68cf46bc3600cd28b4afd0ad9a38b3.png',
        small:
          'nation_flags/small/flag_USA_1b4b2220fa11809cdd5179fa188ef7651382714b66cbbe12d49a0744dff52495.png',
        large:
          'nation_flags/large/flag_USA_bfe874dbd91cdd9e7b77e378d7efeb221931b9b25d24e79a138fe4801050966c.png',
      },
      title: 'U.S.A.',
    },
    {
      name: 'uk',
      id: 3,
      color: 2719672,
      icons: {
        tiny: 'nation_flags/tiny/flag_United_Kingdom_d6308791bceab9314e41018c12d68f2f809d8f92296e77459708373cd6a94113.png',
        small:
          'nation_flags/small/flag_United_Kingdom_447115c659293c9d4cc8f2714d27704a35ba98f17ff4b92b3761f03936c05e1a.png',
        large:
          'nation_flags/large/flag_United_Kingdom_a1656b0242541a0e42ecb717150f626c90a4847a097a1088de38409527787636.png',
      },
      title: 'U.K.',
    },
    {
      name: 'germany',
      id: 4,
      color: 8358796,
      icons: {
        tiny: 'nation_flags/tiny/flag_Germany_8f3e3f4bb152e80cc8fb2cc34d426c6d85d57b72014c768883384055a2c2f3f7.png',
        small:
          'nation_flags/small/flag_Germany_35d04fe7e0bf9b85a2ae507a4d4539bcbe9ea250d04480345156825398edcff8.png',
        large:
          'nation_flags/large/flag_Germany_6ebc035001d082f9cc22317e1184be7806ecf34c7b2857ed65fececc36ec624e.png',
      },
      title: 'Germany',
    },
    {
      name: 'france',
      id: 5,
      color: 1788269,
      icons: {
        tiny: 'nation_flags/tiny/flag_France_d67f8ec126611004d427736132c2ce3b3feace2e6177bdc9e1ff1be6f3afdb26.png',
        small:
          'nation_flags/small/flag_France_56a58c5e668eb6c54ac0b196fe77c4d16a9718b8ff5aa1b102c64b925449bdc3.png',
        large:
          'nation_flags/large/flag_France_a1658fa7ce53d10df1b95e71e667a1aa32f56b0909beb7404e20a0ec5b82af07.png',
      },
      title: 'France',
    },
    {
      name: 'italy',
      id: 6,
      color: 4176426,
      icons: {
        tiny: 'nation_flags/tiny/flag_Italy_52727a3d376751ca3c4547750d0330100c08052581a387a7acadde7503a76463.png',
        small:
          'nation_flags/small/flag_Italy_56198e82a47ece71c1a79662a246de425f605033b41cd0bd1cd50b71b41676f4.png',
        large:
          'nation_flags/large/flag_Italy_1c3ee585f3132d89f71ffadfbbf529b23cb7acade1c1d5b6f9be5687b7770dc8.png',
      },
      title: 'Italy',
    },
    {
      name: 'europe',
      id: 7,
      color: 16763904,
      icons: {
        tiny: 'nation_flags/tiny/flag_Europe_66b735f7c63b1fbc05c33f9f6289a5c5151eb9f7829f407ed4a9966188f19ff4.png',
        small:
          'nation_flags/small/flag_Europe_8faa587e2808905b00609fe38106b8faa37695ee1df9130e767c740f76046b85.png',
        large:
          'nation_flags/large/flag_Europe_f0cc09a6c46f35f01c16395f2e57e67441930ee06a9b3ad57763620493c58054.png',
      },
      title: 'Europe',
    },
    {
      name: 'pan_asia',
      id: 8,
      color: 15774479,
      icons: {
        tiny: 'nation_flags/tiny/flag_Pan_Asia_fae90b7297e33378dbd81d57f61baa5671f67f363435768f1c9f66b39168730b.png',
        small:
          'nation_flags/small/flag_Pan_Asia_52736e629f91a9fe8647ef1a05e8973f32471aef24c3df29caac8d84e59917d8.png',
        large:
          'nation_flags/large/flag_Pan_Asia_43c01cae40c13f6ec165ebef027a7fada24375ac05e018aaa9068ebfef2d8915.png',
      },
      title: 'Pan-Asia',
    },
    {
      name: 'commonwealth',
      id: 9,
      color: 15789327,
      icons: {
        tiny: 'nation_flags/tiny/flag_Commonwealth_e708f80d98342c6cc35ec08bdfebdd98015056ca40ef828fbbd44e57aefd7715.png',
        small:
          'nation_flags/small/flag_Commonwealth_f328561f17ef8caeeb094ef825da4587f78b78b2bd3dd09d66717e5ef359e77f.png',
        large:
          'nation_flags/large/flag_Commonwealth_8b4d3ea923bbcff5194ed7ba63369ff3f8067581b03b4f528bb75b516df40d31.png',
      },
      title: 'Commonwealth',
    },
    {
      name: 'pan_america',
      id: 11,
      color: 16737792,
      icons: {
        tiny: 'nation_flags/tiny/flag_Pan_America_66683fa0d219a205edc85a0afb7155c3746fa17c637393c11ed54e3cc22f3616.png',
        small:
          'nation_flags/small/flag_Pan_America_b5a862eb267c57c58c63401bee8d63f243538429166a238fcb8ed4d191165a30.png',
        large:
          'nation_flags/large/flag_Pan_America_cd8032e6cfcd6850d0a256810ca328539b97d01d2091b42e8376cfe033a774cb.png',
      },
      title: 'Pan-America',
    },
    {
      name: 'netherlands',
      id: 12,
      color: 16711782,
      icons: {
        tiny: 'nation_flags/tiny/flag_Netherlands_f706c692f890e876aeb549103873b16ee8b00ba7bbb4d0c3dd9997894e987bd3.png',
        small:
          'nation_flags/small/flag_Netherlands_95aaa1a8837aaa25b7f8ee01481e08d219f713a314490ed741dd7dcf677dd143.png',
        large:
          'nation_flags/large/flag_Netherlands_1965c4d9d9d6583d4e78729ef6d079e59f074f3f9e98cab6a0cb3fe2e2f93698.png',
      },
      title: 'The Netherlands',
    },
    {
      name: 'spain',
      id: 13,
      color: 9525451,
      icons: {
        tiny: 'nation_flags/tiny/flag_Spain_faddbe9a35a81f9797e36142196ce81595a762969fd57c171f8866b4cf9b9f54.png',
        small:
          'nation_flags/small/flag_Spain_956316c955d6d1ac7b623852fe4a3ba35d401d81ecf4296c3f927d8a1ef23059.png',
        large:
          'nation_flags/large/flag_Spain_e7b90b91cbcbd6ea2191c134e9713dbcb0aaebf0c670911f8a527610fcdf293a.png',
      },
      title: 'Spain',
    },
  ],
  types: {
    Cruiser: {
      sort_order: 3,
      icons: {
        default:
          'vehicle/types/Cruiser/standard_44b68c918edc534e1367cb6512e9e8cc4d28aa54d237db820f1bbba867266742.png',
        normal:
          'vehicle/types/Cruiser/standard_44b68c918edc534e1367cb6512e9e8cc4d28aa54d237db820f1bbba867266742.png',
        premium:
          'vehicle/types/Cruiser/premium_1114542bcd311c388080eea3a4d54a7ea6fdc8706b019fcbf16ace9951f3a000.png',
        special:
          'vehicle/types/Cruiser/special_333a61069a325ba8314cbbae96c1a345c7b03ce9dd6c10cd486cc53c1855ef68.png',
        elite:
          'vehicle/types/Cruiser/elite_127b2a5f66ce04425e45721020a88ed6d6cad202e186f39577cbcd91dd205fe3.png',
      },
      title: 'Cruiser',
    },
    AirCarrier: {
      sort_order: 5,
      icons: {
        default:
          'vehicle/types/AirCarrier/standard_9f372d47b4fa5b5bbd79a3aaac816cb8d5343fa93949cce8934d94b84751b88e.png',
        normal:
          'vehicle/types/AirCarrier/standard_9f372d47b4fa5b5bbd79a3aaac816cb8d5343fa93949cce8934d94b84751b88e.png',
        premium:
          'vehicle/types/AirCarrier/premium_4516ee494bb0396e51796cebff5e45c3f448d9790e0a58082057b8949ed9a3f8.png',
        special:
          'vehicle/types/AirCarrier/special_f75e4cad6399ce68536c0ed26af761c905be8fa208d664915d20fde55b1b6db5.png',
        elite:
          'vehicle/types/AirCarrier/elite_8c5dbbe68e07b0a72c57a04a3d98baadc528f058be3a2e7b198fabeb07172330.png',
      },
      title: 'Aircraft Carrier',
    },
    Battleship: {
      sort_order: 4,
      icons: {
        default:
          'vehicle/types/Battleship/standard_1468cf2ed1dc129ec4db4d9d18306bd06abb0d6b08c805dc94fe23ce6187c119.png',
        normal:
          'vehicle/types/Battleship/standard_1468cf2ed1dc129ec4db4d9d18306bd06abb0d6b08c805dc94fe23ce6187c119.png',
        premium:
          'vehicle/types/Battleship/premium_1d0cabf1997104fd727039ab9c09819260343ab3a9e862f361434d7f42270eb3.png',
        special:
          'vehicle/types/Battleship/special_fdb3e9eabba1009b1c4adb7b370a68a29483aa7a0fe11935b2405792c4968d71.png',
        elite:
          'vehicle/types/Battleship/elite_9fe36e82e214ad6f8dcc305bf8d10d3d0fe35c64628611d9a39f3af01382a567.png',
      },
      title: 'Battleship',
    },
    Destroyer: {
      sort_order: 2,
      icons: {
        default:
          'vehicle/types/Destroyer/standard_357acc9fc0e2f7d98f047c99edffad359a8c45f2093024400fef2b9abbaf3a59.png',
        normal:
          'vehicle/types/Destroyer/standard_357acc9fc0e2f7d98f047c99edffad359a8c45f2093024400fef2b9abbaf3a59.png',
        premium:
          'vehicle/types/Destroyer/premium_9ffc494df739f989c98f2dd3a4e40887299a30d3dfd5b146e85d7ddd08f63744.png',
        special:
          'vehicle/types/Destroyer/special_5d797363651721d76cdb3439cd23845b7efcb8af4c5c3f76cc41b2537b6fc415.png',
        elite:
          'vehicle/types/Destroyer/elite_d4fa1bfbf1f8ca4c5a9ae5e92ccfd4ba66369d93b4e6e3f3880551059cecda22.png',
      },
      title: 'Destroyer',
    },
    Submarine: {
      sort_order: 1,
      icons: {
        default:
          'vehicle/types/Submarine/standard_261525e5aae827700eaad3b5c3ab72d1721446ecab80226394fd30e9186d8a2d.png',
        normal:
          'vehicle/types/Submarine/standard_261525e5aae827700eaad3b5c3ab72d1721446ecab80226394fd30e9186d8a2d.png',
        premium:
          'vehicle/types/Submarine/premium_2da34d2e1f5f4934406d60eb020c1b107857405618c03bbe7710d502b24a5b8b.png',
        special:
          'vehicle/types/Submarine/special_ac6b2659676bb2f9f46f099fd4ad26d30f2fa64d76f6487f382af721ac6bee4f.png',
        elite:
          'vehicle/types/Submarine/elite_48fb6cc4ac86f63e8833e16ac1f7e996f86da5884c3e1b87da9b5ea324f3d5e4.png',
      },
      title: 'Submarine',
    },
  },
} as CompactBundle
