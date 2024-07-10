import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { GalleryService } from '../gallery/gallery.service';
import { GalleryCategory } from './entities/gallery-category.entity';

@Injectable()
export class GalleryCategoryService extends ModelService<GalleryCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<GalleryCategory>,
    private galleryService: GalleryService,
  ) {
    super(db);
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeDelete(job: SqlJob<GalleryCategory>): Promise<void> {
    await super.doBeforeDelete(job);
    try {
      /**check if any gallery in this category */
      const products = (
        await this.galleryService.findAll({
          options: { where: { category_id: job.id } },
        })
      )?.data;
      if (products?.length)
        throw new Error(
          'Cannot delete category because there are galleries in this category.',
        );
    } catch (error) {
      throw error;
    }
  }
}
