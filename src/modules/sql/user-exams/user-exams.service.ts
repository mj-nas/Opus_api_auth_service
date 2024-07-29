import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
    @Inject(forwardRef(() => ExamModuleService))
    private examModuleService: ExamModuleService,
    db: SqlService<UserExams>,
    private learningModuleService: LearningModuleService,
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
      payload: {
        where: { active: true },
        populate: ['web_video', 'web_question_set.web_questions.web_options'],
      },
    });
    console.log('moduless>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(modules.data.length);

    modules.data.map(async (module) => {
      const video = module.web_video.dataValues;
      const questions = module.web_question_set.web_questions.map(
        (e) => e.dataValues,
      );
      // CREATE EXAM VIDEO
      const exam_video = await this.examVideoService.create({
        owner: job.owner,
        action: 'create',
        body: {
          title: video.title,
          video: video.video,
          thumbnail: video.thumbnail,
        },
      });
      // CREATE EXAM QUESTION SET
      const exam_question_set = await this.examQuestionSetService.create({
        owner: job.owner,
        action: 'create',
        body: {
          title: module.web_question_set.title,
        },
      });

      // CREATE EXAM MODULE
      await this.examModuleService.create({
        owner: job.owner,
        action: 'create',
        body: {
          exam_id: response.data.id,
          title: module.title,
          question_set_id: exam_question_set.data.id,
          video_id: exam_video.data.id,
        },
      });
      // CREATE EXAM QUESTIONS
      questions.map(async (question) => {
        const exam_questions = await this.examQuestionsService.create({
          owner: job.owner,
          action: 'create',
          body: {
            question: question.question,
            question_set_id: exam_question_set.data.id,
          },
        });
        // CREATE EXAM QUESTION OPTIONS
        await this.examQuestionOptionsService.$db.createBulkRecords({
          owner: job.owner,
          action: 'create',
          records: question.web_options.map((option) => {
            return {
              question_id: exam_questions.data.id,
              option: option.option,
              is_correct: option.is_correct,
            };
          }),
        });
        // question.web_options.map(async (option) => {
        //   await this.examQuestionOptionsService.create({
        //     owner: job.owner,
        //     action: 'create',
        //     body: {
        //       question_id: exam_questions.data.id,
        //       option: option.option,
        //       is_correct: option.is_correct,
        //     },
        //   });
        // });
      });
    });
  }
}
