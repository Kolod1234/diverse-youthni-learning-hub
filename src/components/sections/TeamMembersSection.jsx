import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter } from 'lucide-react';

export default function TeamMembersSection({ section }) {
  const { team_members = [], title, description } = section;

  if (!team_members.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {description && <p className="text-lg text-gray-600">{description}</p>}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team_members.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
            >
              {member.image && (
                <div className="aspect-square overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                {member.bio && <p className="text-gray-600 text-sm mb-4">{member.bio}</p>}
                
                <div className="flex gap-3">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}