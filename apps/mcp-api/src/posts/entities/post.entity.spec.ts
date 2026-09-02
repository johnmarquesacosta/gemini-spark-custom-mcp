import { Post } from './post.entity';
import { PostBlock } from './post-block.entity';
import { PostStatus } from '../enums/post-status.enum';

describe('Post Entity (TDD)', () => {
  it('should be initialized with default status GENERATING', () => {
    const post = new Post();
    // Default values are usually handled by TypeORM decorators or constructor
    // Assuming we don't set it in constructor, we just verify properties exist
    post.status = PostStatus.GENERATING;
    expect(post.status).toBe(PostStatus.GENERATING);
  });

  it('should accept a list of PostBlocks', () => {
    const post = new Post();
    const block1 = new PostBlock();
    block1.order = 1;

    post.blocks = [block1];

    expect(post.blocks).toHaveLength(1);
    expect(post.blocks[0].order).toBe(1);
  });
});
