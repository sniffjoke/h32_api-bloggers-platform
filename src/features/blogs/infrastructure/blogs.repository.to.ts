import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogEntity } from '../domain/blogs.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { BanInfoForUserDto } from '../api/models/input/ban-user-for-blog.dto';
import { BlogBanEntity } from '../domain/blogBan.entity';
import { BlogBanInfoEntity } from '../domain/blogBanInfo.entity';
import { BlogBanBySuperEntity } from '../domain/blogBanBySuper.entity';

@Injectable()
export class BlogsRepositoryTO {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly bRepository: Repository<BlogEntity>,
    @InjectRepository(BlogBanEntity)
    private readonly banRepository: Repository<BlogBanEntity>,
    @InjectDataSource() public readonly dataSource: DataSource,
  ) {}

  async createBlog(blogData: BlogCreateModel, user?: UserEntity) {
    const blog = new BlogEntity();
    blog.name = blogData.name;
    blog.description = blogData.description;
    blog.websiteUrl = blogData.websiteUrl;
    if (user) {
      blog.user = user;
    }
    const newBlog = await this.bRepository.save(blog);
    const newBanInfoSuperUser = new BlogBanBySuperEntity()
    newBanInfoSuperUser.blogId = newBlog.id
    await this.bRepository.manager.save(newBanInfoSuperUser);
    return newBlog.id;
  }

  async findBlogById(id: string) {
    const findedBlog = await this.bRepository.findOne({
      where: { id },
    });
    if (!findedBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return findedBlog;
  }

  async updateBlogById(id: string, dto: BlogCreateModel) {
    const findedBlog = await this.findBlogById(id);
    if (findedBlog) {
      findedBlog.name = dto.name;
      findedBlog.description = dto.description;
      findedBlog.websiteUrl = dto.websiteUrl;
      await this.bRepository.manager.save(findedBlog);
    }
    return findedBlog;
  }

  async bindUserAsOwnToBlog(blog: BlogEntity, user: UserEntity) {
    blog.user = user;
    return await this.bRepository.manager.save(blog);
  }

  async deleteBlog(id: string) {
    const findedBlog = await this.findBlogById(id);
    return await this.bRepository.delete({ id });
  }

  // async creatBlog(blogData: BlogCreateModel, user?: UserEntity) {
  //   const blog = new BlogEntity();
  //   blog.name = blogData.name;
  //   blog.description = blogData.description;
  //   blog.websiteUrl = blogData.websiteUrl;
  //   if (user) {
  //     blog.user = user;
  //   }
  //   const newBlog = await this.bRepository.save(blog);
  //   return newBlog.id;
  // }

  // --------------------- USERS-BAN ------------------------ //

  async banUserForBlog(dto: BanInfoForUserDto, user: UserEntity) {
    const ifBlogExist = await this.bRepository.findOne({where: {id: dto.blogId}})
    if (!ifBlogExist) throw new NotFoundException(`Blog with id ${dto.blogId} not found`);
    if (dto.isBanned) {
      const isBanExist = await this.banRepository.findOne({
        where: { userId: user.id, blogId: dto.blogId },
      });

      // console.log(isBanExist);

      if (!isBanExist) {
        const ban = new BlogBanEntity();
        ban.blogId = dto.blogId;
        ban.userId = user.id;
        ban.banStatus = true;
        // ban.user = user;
        // ban.blog = blog;
        // console.log('NewBan: ', ban);
        const newBan = await this.banRepository.save(ban);
        const banInfo = new BlogBanInfoEntity()
        banInfo.isBanned = dto.isBanned
        banInfo.banReason = dto.banReason
        banInfo.blogBanId = newBan.id
        await this.banRepository.manager.save(banInfo);
      }
    } else {
      const isBanExist = await this.banRepository.findOne({
        where: { userId: user.id, blogId: dto.blogId },
      });
      if (!isBanExist) {
        // throw new NotFoundException(`Not banned`);
        const ban = new BlogBanEntity();
        ban.blogId = dto.blogId;
        ban.userId = user.id;
        ban.banStatus = false;
        const newBan = await this.banRepository.save(ban);
        const banInfo = new BlogBanInfoEntity()
        banInfo.isBanned = dto.isBanned
        banInfo.banReason = dto.banReason
        banInfo.blogBanId = newBan.id
        await this.banRepository.manager.save(banInfo);
      } else {
        isBanExist.banStatus = false;
        await this.banRepository.save(isBanExist)
        // await this.banRepository.delete({id: isBanExist.id})
      }
    }
    return;
  }

  async getUsersForCurrentBlog(blogId: string) {
    const bannedItems = await this.banRepository.find({
      where: {blogId},
      relations: ['user', 'blogBanInfo'],
    })
    return bannedItems.map(item => {
      const {blogBanId, ...rest} = item.blogBanInfo;
      // console.log('blogBanInfo: ', item.blogBanInfo);
      return {
        id: item.user.id.toString(),
        login: item.user.login,
        banInfo: rest
      }
    });

  }

  async checkUserInBL(userId: string, blogId: string) {
    const   bannedItems = await this.banRepository.find({
      where: {
        userId,
        blogId,
        banStatus: true
      },
      // relations: ['user', 'blogBanInfo'],
    })
    console.log('bannedItems: ', bannedItems);
    return bannedItems
  }

}
