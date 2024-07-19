import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamModuleService } from '../exam-module/exam-module.service';
import { ExamQuestionOptionsService } from '../exam-question-options/exam-question-options.service';
import { ExamQuestionSetService } from '../exam-question-set/exam-question-set.service';
import { ExamQuestionsService } from '../exam-questions/exam-questions.service';
import { ExamVideoService } from '../exam-video/exam-video.service';
import { LearningModuleService } from '../learning-module/learning-module.service';
import { UserExams } from './entities/user-exams.entity';

@Injectable()
export class UserExamsService extends ModelService<UserExams> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<UserExams>,
    private learningModuleService: LearningModuleService,
    private examModuleService: ExamModuleService,
    private examVideoService: ExamVideoService,
    private examQuestionSetService: ExamQuestionSetService,
    private examQuestionOptionsService: ExamQuestionOptionsService,
    private examQuestionsService: ExamQuestionsService,
  ) {
    super(db);
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: SqlJob<UserExams>,
    response: SqlCreateResponse<UserExams>,
  ): Promise<void> {
    await super.doAfterCreate(job, response);
    const modules = await this.learningModuleService.findAll({
      options: {
        where: { active: true },
        include: ['web_video', 'web_question_set', 'web_questions'],
      },
    });
    console.log('modules*********************************');
    console.log(modules);

    const videos = modules.data.map((module) => module.web_video.dataValues);
    console.log('videos*********************************');
    console.log(videos);
    const questionSets = modules.data.map(
      (module) => module.web_question_set.dataValues,
    );
    console.log('questionSets*********************************');
    console.log(questionSets);

    const questions = modules.data.map((module) => {
      return module.web_question_set.dataValues.web_questions.dataValues;
    });
    console.log('questions*********************************');
    console.log(questions);

    // create exam_question_set
    // const createdQuestionSets =
    //   await this.examQuestionSetService.$db.createBulkRecords({
    //     records: questionSets.map((questionSet) => {
    //       return {
    //         title: questionSet.title,
    //       };
    //     }),
    //     owner: job.owner,
    //   });

    // // create exam_video
    // const createdVideos = await this.examVideoService.$db.createBulkRecords({
    //   records: videos.map((video) => {
    //     return {
    //       title: video.title,
    //       video: video.video,
    //       thumbnail: video.thumbnail,
    //     };
    //   }),
    //   owner: job.owner,
    // });

    // //create exam modules
    // const createdModules = await this.examModuleService.$db.createBulkRecords({
    //   records: modules.data.map((module) => {
    //     return {
    //       exam_id: response.data.id,
    //       title: module.title,
    //       question_set_id: module.question_set_id,
    //       video_id: module.video_id,
    //     };
    //   }),
    //   owner: job.owner,
    // });
  }
}
