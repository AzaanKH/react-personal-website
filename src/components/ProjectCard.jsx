import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Github, ExternalLink } from 'lucide-react';

const ProjectCard = ({
  title,
  description,
  githubUrl,
  demoUrl,
  tags = []
}) => {
  // Get accent color based on title (for consistency)
  const getAccentColor = () => {
    const accents = [
      'hsl(var(--primary))',
      '#ae3ec9',
      '#4DABF7',
      '#40C057',
    ];

    const charSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return accents[charSum % accents.length];
  };

  const accentColor = getAccentColor();

  return (
    <motion.div
      className="group h-full"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="relative h-full min-h-[320px] overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Accent top border */}
        <motion.div
          className="absolute left-0 top-0 w-full h-[3px] z-10"
          style={{ background: accentColor }}
          initial={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-card-foreground flex items-baseline gap-2">
            <span style={{ color: accentColor }}>#</span>
            <span>{title}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col justify-between flex-1 space-y-4">
          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>

          {/* Button Footer */}
          <div className="flex gap-2">
            {githubUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="transition-all duration-200 hover:bg-secondary"
              >
                <motion.a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <Github className="w-4 h-4" />
                  Code
                </motion.a>
              </Button>
            )}

            {demoUrl && (
              <Button
                size="sm"
                asChild
                className="transition-all duration-200"
                style={{ backgroundColor: accentColor }}
              >
                <motion.a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </motion.a>
              </Button>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs hover:opacity-100 transition-opacity"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;