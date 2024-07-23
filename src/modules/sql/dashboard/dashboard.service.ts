import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { CommissionService } from '../commission/commission.service';
import { CouponService } from '../coupon/coupon.service';
import { GalleryService } from '../gallery/gallery.service';
import { LearnArticleService } from '../learn-article/learn-article.service';
import { LearnYoutubeService } from '../learn-youtube/learn-youtube.service';
import { LearningModuleService } from '../learning-module/learning-module.service';
import { LearningQuestionSetService } from '../learning-question-set/learning-question-set.service';
import { LearningVideoService } from '../learning-video/learning-video.service';
import { OrderService } from '../order/order.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ProductsService } from '../products/products.service';
import { Role } from '../user/role.enum';
import { Status } from '../user/status.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class DashboardService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    private userService: UserService,
    private productCategoryService: ProductCategoryService,
    private productsService: ProductsService,
    private orderService: OrderService,
    private commissionService: CommissionService,
    private couponService: CouponService,
    private youtubeService: LearnYoutubeService,
    private articleService: LearnArticleService,
    private galleryService: GalleryService,
    private learningVideoService: LearningVideoService,
    private learningQuestionSetService: LearningQuestionSetService,
    private learningModuleService: LearningModuleService,
  ) {}

  getCounts = async () => {
    const customer_management = await this.userService.getCount({
      options: { where: { role: 'customer' } },
    });
    console.log('customer_management', customer_management);

    const applicants_management = await this.userService.getCount({
      options: {
        where: {
          role: Role.Dispenser,
          status: { [Op.in]: [Status.Pending, Status.Deny, Status.Approve] },
          created_by: { [Op.eq]: null },
        },
      },
    });
    console.log('applicants_management', applicants_management);
    const dispenser_management = await this.userService.getCount({
      options: { where: { role: Role.Dispenser, status: Status.Approve } },
    });
    console.log('dispenser_management', dispenser_management);

    const products = await this.productsService.$db.countAllRecords({
      options: {},
    });
    console.log('products', products);
    const orders = await this.orderService.$db.countAllRecords({
      options: {},
    });
    console.log('orders', orders);
    const reorders = await this.orderService.$db.countAllRecords({
      options: { where: { is_a_reorder: true } },
    });
    console.log('reorders', reorders);
    const commission_report = await this.commissionService.$db.countAllRecords({
      options: {},
    });
    console.log('commission_report', commission_report);
    const youtube_management = await this.youtubeService.$db.countAllRecords({
      options: {},
    });
    console.log('youtube_management', youtube_management);
    const article_management = await this.articleService.$db.countAllRecords({
      options: {},
    });
    console.log('article_management', article_management);

    const e_learn_video = await this.learningVideoService.$db.countAllRecords({
      options: {},
    });
    console.log('e_learn_video', e_learn_video);
    const e_learn_questions =
      await this.learningQuestionSetService.$db.countAllRecords({
        options: {},
      });
    console.log('e_learn_questions', e_learn_questions);

    const e_learn_exam = await this.learningModuleService.$db.countAllRecords({
      options: {},
    });
    console.log('e_learn_module', e_learn_exam);

    return {
      customer_management,
      applicants_management,
      dispenser_management,
      products,
      orders,
      reorders,
      commission_report,
      youtube_management,
      article_management,
      e_learn_video,
      e_learn_questions,
      e_learn_exam,
    };
  };
}
