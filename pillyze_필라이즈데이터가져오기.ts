import cheerio from "cheerio";
import request from "request";
import { doesNotThrow } from "assert";
import fs from "fs";

//#region
const getProduct = (pillyze_id: number) => {
  return new Promise((resolve) => {
    request(
      `https://www.pillyze.com/products/${pillyze_id}/%EB%A9%80%ED%8B%B0%EB%B9%84%ED%83%80%EB%AF%BC-%EA%B5%AC%EB%AF%B8`,
      (error, response, body) => {
        if (error) throw error;
        let $ = cheerio.load(body);
        try {
          // id;
          // product_image;
          // product_name;
          // pillyze_id;
          // product_brand;
          // isFood;

          // similar_product_id;
          // main_function;
          // sub_function;
          // eat_method;

          const product_image = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > img"
          ).attr("src");

          const product_name = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > h1"
          ).text();

          const is_food = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > div.marks-wrap > div > div"
          ).text();
          const product_brand = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > a > span"
          ).text();
          const eat_method = $("div.section.section3-3 > div > span").text();

          let main_function: string | null = null;
          let sub_function: string | null = null;
          //main_function / sub_function 가져오기
          $("div.section.section3-2 > div > div.card-tags").each((i, item): any => {
            const list = $(item)
              .html()
              ?.split('<div class="card-tag">')
              .map((i) =>
                i
                  .replace("&amp;", "")
                  .replace("</div>", "")
                  .replace(/[\t\n]/g, "")
              )
              .filter((i) => i)
              .join(", ");
            if (i == 0) {
              //주요기능
              main_function = list ? list : null;
            } else if (i == 1) {
              //보조기능
              sub_function = list ? list : null;
            }
          });

          // log(product_image);
          // log(product_name);
          // log(isFood);
          // log(product_brand);
          // log(eat_method);
          // log(main_function);
          // log(sub_function);

          if (product_name)
            writeQuery(
              insertForm({
                product_image,
                product_name,
                similar_product_id: null,
                pillyze_id,
                product_brand,
                main_function,
                sub_function,
                eat_method,
                is_food,
              })
            ).then(resolve);
        } catch (error) {
          console.error(error);
        }
      }
    );
  });
};

const writeQuery = async (content: string) => await fs.writeFileSync("./query.txt", content, { flag: "a+" });

const insertForm = ({
  product_image = null,
  product_name,
  similar_product_id = null,
  pillyze_id,
  product_brand,
  main_function = null,
  sub_function = null,
  eat_method,
  is_food,
}: {
  product_image?: string | null;
  product_name: string;
  similar_product_id: string | null;
  pillyze_id: number;
  product_brand: string;
  main_function: string | null;
  sub_function: string | null;
  eat_method: string;
  is_food: string;
}) => `INSERT IGNORE INTO F_DAYWORKS.product_pillyze
(product_image, product_name, similar_product_id, pillyze_id, product_brand, main_function, sub_function, eat_method, is_food)
VALUES('${product_image}', '${product_name}', ${similar_product_id}, ${pillyze_id}, '${product_brand}', '${main_function}', '${sub_function}', '${eat_method}', '${is_food}');
`;
//#endregion

// getProduct(30000);
const exceptList: number[] = [
  4001, 4002, 4003, 4004, 4012, 4015, 4017, 4021, 4027, 4031, 4038, 4045, 4059, 4062, 4076, 4077, 4081, 4089, 4103,
  4105, 4112, 4119, 4124, 4131, 4139, 4144, 4147, 4149, 4153, 4156, 4172, 4184, 4188, 4202, 4210, 4213, 4225, 4232,
  4244, 4246, 4247, 4253, 4258, 4277, 4289, 4295, 4298, 4300, 4301, 4304, 4311, 4319, 4321, 4322, 4327, 4331, 4332,
  4333, 4334, 4337, 4345, 4357, 4358, 4367, 4380, 4381, 4388, 4419, 4426, 4444, 4446, 4448, 4449, 4452, 4461, 4477,
  4479, 4482, 4487, 4492, 4500, 4501, 4507, 4512, 4516, 4519, 4537, 4538, 4539, 4541, 4566, 4569, 4579, 4585, 4591,
  4595, 4597, 4601, 4611, 4618, 4623, 4630, 4672, 4677, 4692, 4699, 4701, 4702, 4704, 4712, 4718, 4733, 4734, 4753,
  4756, 4763, 4766, 4780, 4784, 4785, 4796, 4797, 4799, 4801, 4802, 4808, 4810, 4817, 4819, 4822, 4825, 4826, 4828,
  4841, 4850, 4851, 4861, 4866, 4871, 4874, 4878, 4884, 4886, 4889, 4892, 4899, 4905, 4924, 4938, 4940, 4956, 4959,
  4961, 4969, 4971, 4973, 4981, 4992, 5003, 5008, 5012, 5022, 5029, 5030, 5032, 5035, 5056, 5059, 5063, 5070, 5074,
  5088, 5106, 5107, 5118, 5122, 5125, 5126, 5131, 5132, 5136, 5137, 5145, 5147, 5151, 5165, 5170, 5186, 5187, 5189,
  5193, 5196, 5200, 5208, 5209, 5217, 5220, 5267, 5274, 5281, 5293, 5294, 5296, 5297, 5301, 5304, 5305, 5306, 5313,
  5329, 5353, 5358, 5359, 5361, 5362, 5373, 5398, 5416, 5419, 5422, 5427, 5454, 5466, 5480, 5483, 5484, 5486, 5512,
  5527, 5538, 5542, 5543, 5548, 5552, 5555, 5558, 5562, 5565, 5574, 5578, 5581, 5590, 5601, 5605, 5609, 5615, 5621,
  5634, 5643, 5653, 5661, 5680, 5682, 5683, 5684, 5685, 5687, 5693, 5694, 5696, 5712, 5714, 5735, 5736, 5737, 5738,
  5743, 5747, 5748, 5749, 5753, 5758, 5762, 5765, 5766, 5770, 5777, 5789, 5791, 5794, 5799, 5803, 5806, 5809, 5811,
  5818, 5821, 5826, 5827, 5831, 5832, 5834, 5843, 5844, 5845, 5847, 5849, 5851, 5852, 5858, 5859, 5868, 5884, 5897,
  5899, 5917, 5925, 5927, 5931, 5933, 5934, 5960, 5963, 5964, 5971, 5973, 5976, 5985, 5991, 6006, 6015, 6018, 6019,
  6021, 6029, 6031, 6032, 6035, 6036, 6039, 6041, 6042, 6043, 6045, 6047, 6048, 6053, 6185, 6225, 6358, 6398, 6401,
  6407, 6423, 6441, 6442, 6456, 6462, 6470, 6473, 6481, 6488, 6493, 6495, 6506, 6507, 6512, 6518, 6521, 6537, 6538,
  6562, 6567, 6576, 6587, 6590, 6591, 6602, 6605, 6612, 6622, 6646, 6654, 6656, 6666, 6678, 6687, 6697, 6700, 6706,
  6709, 6720, 6724, 6730, 6748, 6759, 6767, 6769, 6780, 6785, 6822, 6827, 6837, 6856, 6879, 6882, 6884, 6903, 6912,
  6940, 6951, 6954, 6970, 6974, 6975, 6979, 6986, 6993, 6999, 7009, 7024, 7025, 7027, 7029, 7034, 7066, 7069, 7073,
  7074, 7094, 7102, 7133, 7146, 7151, 7154, 7158, 7174, 7178, 7180, 7181, 7184, 7187, 7193, 7196, 7197, 7200, 7205,
  7211, 7221, 7230, 7233, 7239, 7246, 7247, 7254, 7259, 7268, 7272, 7280, 7284, 7286, 7298, 7301, 7305, 7320, 7321,
  7325, 7331, 7336, 7339, 7342, 7343, 7344, 7346, 7349, 7357, 7364, 7376, 7381, 7383, 7384, 7386, 7388, 7389, 7392,
  7394, 7398, 7399, 7401, 7411, 7424, 7425, 7426, 7432, 7434, 7441, 7454, 7455, 7461, 7465, 7466, 7469, 7485, 7486,
  7655, 7706, 7742, 7771, 7782, 7793, 7794, 7803, 7810, 7826, 7827, 7845, 7858, 7866, 7868, 7871, 7877, 7879, 7902,
  7905, 7915, 7919, 7922, 7927, 7931, 7932, 7939, 7961, 7963, 7970, 7973, 7984, 7985, 7991, 7999, 8012, 8018, 8022,
  8060, 8063, 8064, 8070, 8074, 8077, 8091, 8098, 8104, 8110, 8114, 8136, 8137, 8140, 8144, 8150, 8151, 8157, 8161,
  8169, 8174, 8200, 8204, 8208, 8215, 8219, 8220, 8229, 8235, 8236, 8237, 8261, 8282, 8284, 8299, 8301, 8310, 8314,
  8325, 8331, 8344, 8345, 8375, 8382, 8383, 8389, 8396, 8425, 8434, 8439, 8447, 8453, 8470, 8488, 8511, 8517, 8521,
  8526, 8527, 8529, 8530, 8531, 8540, 8544, 8545, 8554, 8555, 8558, 8568, 8571, 8572, 8575, 8577, 8580, 8581, 8584,
  8594, 8603, 8633, 8636, 8649, 8650, 8838, 8847, 8854, 8856, 8859, 8867, 8868, 8873, 8874, 8875, 8876, 8879, 8883,
  8884, 8887, 8888, 8904, 8933, 8944, 8955, 8956, 8969, 8978, 8981, 8982, 8984, 8991,
];
Array.from({ length: 2000 }).forEach(async (i, index) => {
  const id = index + 1 + 6000;
  if (!exceptList.includes(id)) await getProduct(id);
});
