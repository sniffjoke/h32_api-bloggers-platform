import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { PostEntity } from '../../posts/domain/posts.entity';
import {UserEntity} from "../../users/domain/user.entity";
import { BlogBanEntity } from './blogBan.entity';


@Entity('blogs')
export class BlogEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    websiteUrl: string;

    @Column({default: false})
    isMembership: boolean;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @Column({nullable: true})
    userId: string;


    @OneToMany(() => PostEntity, (post) => post.blog, { cascade: true })
    posts: PostEntity[]

    @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => BlogBanEntity, (blogBan) => blogBan.blog, { cascade: true })
    blogsBans: BlogBanEntity[];

}
